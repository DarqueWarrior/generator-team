const async = require('async');
const request = require('request');
const package = require('../../package.json');

const BUILD_API_VERSION = `2.0`;
const PROJECT_API_VERSION = `1.0`;
const RELEASE_API_VERSION = `3.0-preview.3`;
const DISTRIBUTED_TASK_API_VERSION = `3.0-preview.1`;
const SERVICE_ENDPOINTS_API_VERSION = `3.0-preview.1`;

function encodePat(pat) {
   'use strict';

   // The personal access token must be 64 bit encoded to be used
   // with the REST API

   let b = new Buffer(`:` + pat);
   let s = b.toString(`base64`);

   return s;
}

function addUserAgent(options, userAgent) {
   options.headers['user-agent'] = getUserAgent(userAgent);
   return options;
}

function getUserAgent(userAgent) {
   return `${userAgent}/${package.version} (${process.platform}: ${process.arch}) Node.js/${process.version}`;
}

function getFullURL(instance, includeCollection, forRM) {
   // The user MUST only enter the VSTS account name and not the full url.
   // This is how the system determines which system is being targeted.  Some
   // URL for VSTS are not the same as they are for TFS for example Release
   // Management. 

   // When used with VSTS all the user provides is the account name. But When
   // it is used with TFS they give the full url including the collection. This
   // functions makes sure any code needing the full URL gets that they need to
   // continue without worrying if it is TFS or VSTS.
   if (instance.toLowerCase().match(/http/) !== null) {
      return instance;
   }

   let vstsURL = `https://${instance}.visualstudio.com`;

   if (forRM) {
      vstsURL = `https://${instance}.vsrm.visualstudio.com`;
   }

   if (includeCollection) {
      vstsURL += `/DefaultCollection`;
   }

   return vstsURL;
}

function checkStatus(uri, token, userAgent, callback) {
   'use strict';

   // Simply issues a get to the provided URI and returns
   // the body as JSON.  Call this when the action taken
   // requires time to process.

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "authorization": `Basic ${token}`
      },
      "url": `${uri}`
   }, userAgent);

   request(options, function (err, res, body) {
      callback(err, JSON.parse(body));
   });
}

function deleteBuildDefinition(account, projectId, buildDefinitionId, pat, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   let options = addUserAgent({
      "method": `Delete`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true)}/${projectId}/_apis/build/definitions/${buildDefinitionId}`,
      "qs": {
         "api-version": BUILD_API_VERSION
      }
   }, userAgent);

   request(options, function (err, res, body) {
      callback(err, null);
   });
}

function deleteProject(account, projectId, pat, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   let options = addUserAgent({
      "method": `Delete`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/_apis/projects/${projectId}`,
      "qs": {
         "api-version": PROJECT_API_VERSION
      }
   }, userAgent);

   request(options, function (err, res, body) {
      callback(err, null);
   });
}

function findProject(account, project, pat, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   let options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/_apis/projects/${project}`,
      "qs": {
         "api-version": PROJECT_API_VERSION
      }
   }, userAgent);

   request(options, function (err, res, body) {

      if (err) {
         callback(err, null);
         return;
      }

      // Test for this before you try and parse the body.
      // When a 203 is returned the body is HTML instead of
      // JSON and will throw an exception if you try and parse.
      // I only test this here because the project is required for
      // all other items. 
      if (res.statusCode === 203) {
         // You get this when the site tries to send you to the
         // login page.
         callback({
            "message": `Unable to authenticate with Team Services. Check account name and personal access token.`
         });
         return;
      }

      if (res.statusCode === 404) {
         // Returning a undefined project indicates it was not found
         // But this is not an error. Only server errors should be 
         // returned as an error to the caller.
         callback(null, undefined);
      } else {
         let obj = JSON.parse(body);

         // Return the team project we just found.
         callback(err, obj);
      }
   });
}

// TODO: Add sourceControl type and template as options.
function createProject(account, project, pat, userAgent, callback) {
   "use strict";

   var teamProject = {};
   let token = encodePat(pat);

   var options = addUserAgent({
      method: 'POST',
      headers: {
         'content-type': 'application/json',
         authorization: `Basic ${token}`
      },
      json: true,
      url: `${getFullURL(account)}/_apis/projects`,
      qs: {
         'api-version': PROJECT_API_VERSION
      },
      body: {
         name: project,
         capabilities: {
            versioncontrol: {
               sourceControlType: 'Git'
            },
            processTemplate: {
               templateTypeId: '6b724908-ef14-45cf-84f8-768b5384da45'
            }
         }
      }
   }, userAgent);

   async.series([
      function (thisSeries) {
         request(options, function (err, res, body) {
            teamProject = body;
            thisSeries(err);
         });
      },
      function (thisSeries) {
         var status = '';

         // Wait for Team Services to report that the project was created.
         // Use whilst to keep calling the the REST API until the status is
         // either failed or succeeded.
         async.whilst(
            function () {
               return status !== 'failed' && status !== 'succeeded';
            },
            function (finished) {
               checkStatus(teamProject.url, token, userAgent, function (err, stat) {
                  status = stat.status;
                  finished(err);
               });
            },
            thisSeries
         );
      },
      function (thisSeries) {
         var options = addUserAgent({
            method: 'GET',
            headers: {
               'cache-control': 'no-cache',
               'authorization': `Basic ${token}`
            },
            url: `${getFullURL(account)}/_apis/projects/${project}`,
            qs: {
               'api-version': PROJECT_API_VERSION
            }
         }, userAgent);

         // Get the real id of the team project now that is exist.
         request(options, function (err, res, body) {
            if (err) {
               thisSeries(err);
               return;
            }

            if (res.statusCode !== 200) {
               thisSeries({
                  message: 'Unable to find newly created project.'
               });
               return;
            }

            var project = JSON.parse(body);
            thisSeries(err, project);
         });
      }
   ], function (err, result) {
      // By the time I get there the series would have completed and
      // the first two entries in result would be null.  I only want
      // to return the team project and not the array because when we
      // find the team project if it already exist we only return the
      // team project.
      callback(err, result[2]);
   });
}

function findBuildDefinition(account, projectId, pat, name, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true)}/${projectId}/_apis/build/definitions`,
      "qs": {
         "api-version": BUILD_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      var bld = obj.value.find(function (i) {
         return i.name === name;
      });

      callback(e, bld);
   });
}

function getBuildLog(account, projectId, pat, id, userAgent, callback){
   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true)}/${projectId}/_apis/build/builds/${id}/logs`,
      "qs": {
         "api-version": BUILD_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      options.url = obj.value[obj.value.length - 2].url;

      request(options, function (e, response, data) {
         callback(e, data);
      });
   });
}

function getBuilds(account, projectId, pat, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true)}/${projectId}/_apis/build/builds`,
      "qs": {
         "api-version": BUILD_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      callback(e, obj.value);
   });
}

function findReleaseDefinition(account, projectId, pat, name, userAgent, callback) {
   "use strict";

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true, true)}/${projectId}/_apis/release/definitions`,
      "qs": {
         "api-version": RELEASE_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      var rel = obj.value.find(function (i) {
         return i.name === name;
      });

      callback(e, rel);
   });
}

function getReleases(account, projectId, pat, userAgent, callback) {
   "use strict";

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true, true)}/${projectId}/_apis/release/releases?$expand=environments`,
      "qs": {
         "api-version": RELEASE_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      callback(e, obj.value);
   });
}

function setApproval(account, projectId, pat, id, userAgent, callback) {
   "use strict";

   let token = encodePat(pat);
   let body = `{ "status": "Approved", "approver": "", "comments": "" }`;

   var options = addUserAgent({
      "method": `PATCH`,
      "headers": {
         "cache-control": `no-cache`,
         'content-type': 'application/json',
         "authorization": `Basic ${token}`
      },
      "body": body,
      "url": `${getFullURL(account, true, true)}/${projectId}/_apis/release/approvals/${id}`,
      "qs": {
         "api-version": DISTRIBUTED_TASK_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      callback(e, obj);
   });
}

function getApprovals(account, projectId, pat, userAgent, callback) {
   "use strict";

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account, true, true)}/${projectId}/_apis/release/approvals`,
      "qs": {
         "api-version": DISTRIBUTED_TASK_API_VERSION
      }
   }, userAgent);

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      callback(e, obj);
   });
}

function findAzureServiceEndpoint(account, projectId, pat, name, userAgent, callback) {
   'use strict';

   let token = encodePat(pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
      "qs": {
         "api-version": SERVICE_ENDPOINTS_API_VERSION
      }
   });

   request(options, function (error, response, body) {
      var obj = JSON.parse(body);

      var endpoint = obj.value.find(function (i) {
         return i.data.subscriptionName === name;
      });

      // Down stream we need the full endpoint so call again with the ID. This will return more data
      getServiceEndpoint(account, projectId, endpoint.id, token, callback);
   });
}

function getServiceEndpoint(account, projectId, id, token, callback) {
   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints/${id}`,
      "qs": {
         "api-version": SERVICE_ENDPOINTS_API_VERSION
      }
   });

   request(options, function (error, response, body) {
      callback(error, JSON.parse(body));
   });
}

module.exports = {
   // Exports the portions of the file we want to share with files that require
   // it.
   getBuilds: getBuilds,
   getBuildLog: getBuildLog,
   findProject: findProject,
   getReleases: getReleases,
   setApproval: setApproval,
   getApprovals: getApprovals,
   deleteProject: deleteProject,
   createProject: createProject,
   findBuildDefinition: findBuildDefinition,
   deleteBuildDefinition: deleteBuildDefinition,
   findReleaseDefinition: findReleaseDefinition,
   findAzureServiceEndpoint: findAzureServiceEndpoint
};