const request = require('request');
const package = require('../../package.json');

const PROJECT_API_VERSION = '1.0';

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

module.exports = {
   // Exports the portions of the file we want to share with files that require
   // it.
   findProject: findProject,
   deleteProject: deleteProject
};