const url = require('url');
const request = require(`request`);
const package = require('../../package.json');

const BUILD_API_VERSION = `2.0`;
const PROJECT_API_VERSION = `1.0`;
const RELEASE_API_VERSION = `3.0-preview.3`;
const DISTRIBUTED_TASK_API_VERSION = `3.0-preview.1`;
const SERVICE_ENDPOINTS_API_VERSION = `3.0-preview.1`;

var logging = process.env.LOGYO || `off`;

var logMessage = function (msg) {
   if (logging === `on`) {
      console.log(msg);
   }
};

String.prototype.replaceAll = function (search, replacement) {
   var target = this;
   return target.split(search).join(replacement);
};

function isDocker(value) {
   return value === `docker` || value === `dockerpaas` || value === `acilinux`;
}

function getDockerRegistryServer(server) {
   let parts = url.parse(server);

   return parts.host;
}

function getImageNamespace(registryId, endPoint) {
   let dockerNamespace = registryId ? registryId.toLowerCase() : null;

   if (endPoint && endPoint.authorization && !isDockerHub(endPoint.authorization.parameters.registry)) {
      dockerNamespace = getDockerRegistryServer(endPoint.authorization.parameters.registry);
   }

   return dockerNamespace;
}

function addUserAgent(options) {
   options.headers['user-agent'] = getUserAgent();
   return options;
}

function getUserAgent() {
   return `Yo Team/${package.version} (${process.platform}: ${process.arch}) Node.js/${process.version}`;
}

function reconcileValue(first, second, fallback) {
   // The only way I found to get the CLI to work when I need
   // to skip values is to enter " ". That space throws off 
   // other portions of the code that test for the exisitence 
   // of a value.  Triming the strings will only leave non
   // whitespace.
   return first ? first.trim() : (second ? second.trim() : fallback);
}

// If the user has selected Java and Hosted Linux Preview you
// can't select App Service because you have to use PowerShell
// to convert the war file into a zip file.
function getTargets(answers) {

   if (answers.type === `aspFull`) {
      return [{
         name: `Azure App Service`,
         value: `paas`
      }];
   }

   let result = [{
      name: `Azure App Service`,
      value: `paas`
   }, {
      name: `Azure Container Instances (Linux)`,
      value: `acilinux`
   }, {
      name: `Azure App Service Docker (Linux)`,
      value: `dockerpaas`
   }, {
      name: `Docker Host`,
      value: `docker`
   }];

   if (answers.type === `java` &&
      answers.queue === `Hosted Linux Preview`) {
      // Remove Azure App Service
      result.splice(0, 1);
   }

   return result;
}

function getAppTypes(answers) {
   // Default to languages tha work on all agents
   let types = [{
      name: `.NET Core`,
      value: `asp`
   }, {
      name: `Node.js`,
      value: `node`
   }, {
      name: `Java`,
      value: `java`
   }];

   // If this is not a Linux based agent also show
   // .NET Full
   if (answers.queue.indexOf(`Linux`) === -1) {
      types.splice(1, 0, {
         name: `.NET Framework`,
         value: `aspFull`
      });
   }

   return types;
}

function getPATPrompt(answers) {
   if (!answers.tfs) {
      // The user passed in the tfs value on the
      // command line but we still need to prompt
      // for the pat.  answers will not have a tfs
      // value so send a generic response.
      return `What is your Personal Access Token?`;
   }

   if (isVSTS(answers.tfs)) {
      return `What is your VSTS Personal Access Token?`;
   }

   return `What is your TFS Personal Access Token?`;
}

function getInstancePrompt() {
   return `Enter Team Services account name\n  ({account}.visualstudio.com)\n  Or full TFS URL including collection\n  (http://tfs:8080/tfs/DefaultCollection)?`;
}

function getDefaultPortMapping(answers) {
   if (answers.target === `docker`) {
      if (answers.type === `java`) {
         return `8080:8080`;
      } else if (answers.type === `node`) {
         return `3000:3000`;
      } else {
         return `80:80`;
      }
   } else {
      if (answers.type === `java`) {
         return `8080`;
      } else if (answers.type === `node`) {
         return `3000`;
      } else {
         return `80`;
      }
   }
}

function validateRequired(input, msg) {
   return !input ? msg : true;
}

function validatePortMapping(input) {
   return validateRequired(input, `You must provide a Port Mapping`);
}

function validateGroupID(input) {
   return validateRequired(input, `You must provide a Group ID`);
}

function validateApplicationName(input) {
   return validateRequired(input, `You must provide a name for your application`);
}

function validatePersonalAccessToken(input) {
   return validateRequired(input, `You must provide a Personal Access Token`);
}

function validateTFS(input) {
   return validateRequired(input, `You must provide your TFS URL or Team Service account name`);
}

function validateAzureSub(input) {
   return validateRequired(input, `You must provide an Azure Subscription Name`);
}

function validateDockerHost(input) {
   return validateRequired(input, `You must provide a Docker Host URL`);
}

function validateDockerCertificatePath(input) {
   return validateRequired(input, `You must provide a Docker Certificate Path`);
}

function validateDockerHubID(input) {
   return validateRequired(input, `You must provide a Docker Registry username`);
}

function validateDockerHubPassword(input) {
   return validateRequired(input, `You must provide a Docker Registry Password`);
}

function validateDockerRegistry(input) {
   if (!input) {
      return validateRequired(input, `You must provide a Docker Registry URL`);
   }

   return input.toLowerCase().match(/http/) === null ? `You must provide a Docker Registry URL including http(s)` : true;
}

function validateAzureSubID(input) {
   return validateRequired(input, `You must provide an Azure Subscription ID`);
}

function validateAzureTenantID(input) {
   return validateRequired(input, `You must provide an Azure Tenant ID`);
}

function validateServicePrincipalID(input) {
   return validateRequired(input, `You must provide a Service Principal ID`);
}

function validateServicePrincipalKey(input) {
   return validateRequired(input, `You must provide a Service Principal Key`);
}

function tokenize(input, nvp) {
   for (var key in nvp) {
      input = input.replaceAll(key, nvp[key]);
   }

   return input;
}

function encodePat(pat) {
   'use strict';

   // The personal access token must be 64 bit encoded to be used
   // with the REST API

   var b = new Buffer(`:` + pat);
   var s = b.toString(`base64`);

   return s;
}

function checkStatus(uri, token, gen, callback) {
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
   });

   request(options, function (err, res, body) {

      let obj = {};

      try {
         obj = JSON.parse(body);
      } catch (error) {
         // This a HTML page with an error message.
         err = error;
         console.log(body);
      }

      callback(err, obj);
   });
}

function tryFindDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, token, callback) {
   'use strict';

   // Will NOT throw an error if the endpoint is not found.  This is used
   // by code that will create the endpoint if it is not found.

   findDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, token, function (e, ep) {
      if (e && e.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(e, ep);
      }
   });
}

function findDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, token, callback) {
   'use strict';

   // There is nothing to do
   if (!dockerRegistry) {
      callback(null, null);
      return;
   }

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

      // TODO: Test that authorization.parameters.registry === dockerHost.  But that requires
      // a second REST call once you know the ID of the dockerregistry type service endpoint.
      // For now assume any dockerregistry service endpoint is safe to use.
      var endpoint = obj.value.find(function (i) {
         return i.type === `dockerregistry`;
      });

      if (endpoint === undefined) {
         callback({
            "message": `x Could not find Docker Registry Service Endpoint`,
            "code": `NotFound`
         }, undefined);
      } else {
         // Down stream we need the full endpoint so call again with the ID. This will return more data
         getServiceEndpoint(account, projectId, endpoint.id, token, callback);
      }
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

function tryFindDockerServiceEndpoint(account, projectId, dockerHost, token, gen, callback) {
   'use strict';

   // Will NOT throw an error if the endpoint is not found.  This is used
   // by code that will create the endpoint if it is not found.

   findDockerServiceEndpoint(account, projectId, dockerHost, token, gen, function (e, ep) {
      if (e && e.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(e, ep);
      }
   });
}

function findDockerServiceEndpoint(account, projectId, dockerHost, token, gen, callback) {
   'use strict';

   // There is nothing to do
   if (!dockerHost) {
      callback(null, null);
      return;
   }

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
      // Check the response statusCode first. If it is not a 200
      // the body will be html and not JSON
      if (response.statusCode >= 400) {
         callback(`Error trying to find Docker Service Endpoint: ${response.statusMessage}`);
         return;
      }

      var obj = JSON.parse(body);

      // The i.url is returned with a trailing / so just use starts with just in case
      // the dockerHost is passed in without it
      var endpoint = obj.value.find(function (i) {
         return i.url.startsWith(dockerHost);
      });

      if (endpoint === undefined) {
         callback({
            "message": `x Could not find Docker Service Endpoint`,
            "code": `NotFound`
         }, undefined);
      } else {
         callback(error, endpoint);
      }
   });
}

function tryFindAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   'use strict';

   // Will NOT throw an error if the endpoint is not found.  This is used
   // by code that will create the endpoint if it is not found.

   findAzureServiceEndpoint(account, projectId, sub, token, gen, function (err, ep) {
      if (err && err.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(err, ep);
      }
   });
}

function findAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   'use strict';

   // There is nothing to do
   if (!sub.name) {
      callback(null, null);
      return;
   }

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
         return i.data.subscriptionName === sub.name;
      });

      if (endpoint === undefined) {
         callback({
            "message": `x Could not find Azure Service Endpoint`,
            "code": `NotFound`
         }, undefined);
      } else {
         // Down stream we need the full endpoint so call again with the ID. This will return more data
         getServiceEndpoint(account, projectId, endpoint.id, token, callback);
      }
   });
}

function findAzureSub(account, subName, token, gen, callback) {
   "use strict";

   var options = addUserAgent({
      method: 'GET',
      headers: {
         'cache-control': 'no-cache',
         'content-type': 'application/json',
         'authorization': `Basic ${token}`
      },
      url: `${getFullURL(account)}/_apis/distributedtask/serviceendpointproxy/azurermsubscriptions`
   });

   request(options, function (error, response, body) {
      var obj = JSON.parse(body);

      var sub = obj.value.find(function (i) {
         return i.displayName === subName;
      });

      callback(error, sub);
   });
}

function tryFindProject(account, project, token, gen, callback) {
   'use strict';

   // Will NOT throw an error if the project is not found.  This is used
   // by code that will create the project if it is not found.

   findProject(account, project, token, gen, function (err, obj) {
      if (err && err.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(err, obj);
      }
   });
}

function findProject(account, project, token, gen, callback) {
   'use strict';

   // Will throw an error if the project is not found. This is used
   // by code that requires a project and will stop execution if the
   // project is not found.

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/_apis/projects/${project}`,
      "qs": {
         "api-version": PROJECT_API_VERSION
      }
   });

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
         gen.log.error(`Unable to authenticate with Team Services. Check account name and personal access token.`);
         callback({
            "message": `Unable to authenticate with Team Services. Check account name and personal access token.`
         });
         return;
      }

      if (res.statusCode === 404) {
         // Returning a undefined project indicates it was not found
         callback({
            "message": `x Project ${project} not found`,
            "code": `NotFound`
         }, undefined);
      } else {
         var obj = JSON.parse(body);

         // Return the team project we just found.
         callback(err, obj);
      }
   });
}

function findQueue(name, account, teamProject, token, callback) {
   'use strict';

   logMessage(`findQueue params: ${name}, ${teamProject.id}`);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/${teamProject.id}/_apis/distributedtask/queues`,
      "qs": {
         "api-version": DISTRIBUTED_TASK_API_VERSION,
         "queueName": name
      }
   });

   request(options, function (err, res, body) {
      var obj = JSON.parse(body);

      if (res.statusCode >= 400) {
         callback(new Error(res.statusMessage), null);
      } else if (res.statusCode >= 300) {
         // When it is a 300 the obj is a error
         // object from the server
         callback(obj);
      } else {
         // Setting to null is the all clear signal to the async
         // series to continue
         logMessage(`findQueue: ${res.statusCode}, ${obj}`);
         callback(null, obj.value[0].id);
      }
   });
}

function tryFindBuild(account, teamProject, token, target, callback) {
   'use strict';

   findBuild(account, teamProject, token, target, function (e, bld) {
      if (e && e.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(e, bld);
      }
   });
}

function findBuild(account, teamProject, token, target, callback) {
   'use strict';

   var name = isDocker(target) ? `${teamProject.name}-Docker-CI` : `${teamProject.name}-CI`;
   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(account)}/${teamProject.id}/_apis/build/definitions`,
      "qs": {
         "api-version": BUILD_API_VERSION
      }
   });

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      var bld = obj.value.find(function (i) {
         return i.name === name;
      });

      if (!bld) {
         callback({
            "message": `x Build ${name} not found`,
            "code": `NotFound`
         }, undefined);
      } else {
         callback(e, bld);
      }
   });
}

function tryFindRelease(args, callback) {
   'use strict';

   findRelease(args, function (e, rel) {
      if (e && e.code === `NotFound`) {
         callback(null, undefined);
      } else {
         callback(e, rel);
      }
   });
}

function findRelease(args, callback) {
   "use strict";

   var name = (args.target === `docker` || args.target === `dockerpaas`) ? `${args.appName}-Docker-CD` : `${args.appName}-CD`;

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${args.token}`
      },
      "url": `${getFullURL(args.account, true, true)}/${args.teamProject.name}/_apis/release/definitions`,
      "qs": {
         "api-version": RELEASE_API_VERSION
      }
   });

   request(options, function (e, response, body) {
      var obj = JSON.parse(body);

      var rel = obj.value.find(function (i) {
         return i.name === name;
      });

      if (!rel) {
         callback({
            "message": `x Release ${name} not found`,
            "code": `NotFound`
         }, undefined);
      } else {
         callback(e, rel);
      }
   });
}

function getAzureSubs(answers) {
   "use strict";

   var token = encodePat(answers.pat);

   var options = addUserAgent({
      method: 'GET',
      headers: {
         'cache-control': 'no-cache',
         'content-type': 'application/json',
         'authorization': `Basic ${token}`
      },
      url: `${getFullURL(answers.tfs)}/_apis/distributedtask/serviceendpointproxy/azurermsubscriptions`
   });

   return new Promise(function (resolve, reject) {
      request(options, function (e, response, body) {
         if (e) {
            reject(e);
            return;
         }

         var obj = JSON.parse(body);

         var result = [];

         obj.value.forEach((sub) => {
            result.push({
               name: sub.displayName
            });
         });

         resolve(result);
      });
   });
}

function getPools(answers) {
   "use strict";

   var token = encodePat(answers.pat);

   var options = addUserAgent({
      "method": `GET`,
      "headers": {
         "cache-control": `no-cache`,
         "authorization": `Basic ${token}`
      },
      "url": `${getFullURL(answers.tfs)}/_apis/distributedtask/pools`,
      "qs": {
         "api-version": DISTRIBUTED_TASK_API_VERSION
      }
   });

   return new Promise(function (resolve, reject) {
      request(options, function (e, response, body) {
         if (e) {
            reject(e);
            return;
         }

         var obj = JSON.parse(body);
         resolve(obj.value);
      });
   });
}

function isDockerHub(dockerRegistry) {
   return dockerRegistry.toLowerCase().match(/index.docker.io/) !== null;
}

function extractInstance(input) {
   // When using VSTS we only want the account name but
   // people continue to give the entire url which will
   // cause issues later. So check to see if the value
   // provided contains visualstudio.com and if so extract
   // the account name and simply return that.

   // If you find visualstudio.com in the name the user most
   // likely entered the entire URL instead of just the account name
   // so lets extract it.
   if (input.toLowerCase().match(/visualstudio.com/) === null) {
      return input;
   }

   var myRegexp = /([^/]+)\.visualstudio.com/;
   var match = myRegexp.exec(input);

   return match[1];
}

function needsRegistry(answers, cmdLnInput) {
   if (cmdLnInput !== undefined) {
      return (answers.target === `docker` ||
         cmdLnInput.target === `docker` ||
         answers.target === `acilinux` ||
         cmdLnInput.target === `acilinux` ||
         answers.target === `dockerpaas` ||
         cmdLnInput.target === `dockerpaas`);
   } else {
      return (answers.target === `docker` ||
         answers.target === `acilinux` ||
         answers.target === `dockerpaas`);
   }
}

function needsDockerHost(answers, cmdLnInput) {
   let isDocker;
   let paasRequiresHost;

   if (cmdLnInput !== undefined) {
      // If you pass in the target on the command line 
      // answers.target will be undefined so test cmdLnInput
      isDocker = (answers.target === `docker` || cmdLnInput.target === `docker`);
      
      // This will be true if the user did not select the Hosted Linux queue
      paasRequiresHost = (answers.target === `dockerpaas` ||
            cmdLnInput.target === `dockerpaas` ||
            answers.target === `acilinux` ||
            cmdLnInput.target === `acilinux`) &&
         ((answers.queue !== undefined && answers.queue.indexOf(`Linux`) === -1) &&
            (cmdLnInput.queue !== undefined && cmdLnInput.queue.indexOf(`Linux`) === -1));
   } else {
      // If you pass in the target on the command line 
      // answers.target will be undefined so test cmdLnInput
      isDocker = answers.target === `docker`;

      // This will be true the user did not select the Hosted Linux queue
      paasRequiresHost = (answers.target === `dockerpaas` || answers.target === `acilinux`) && answers.queue.indexOf(`Linux`) === -1;
   }

   logMessage(`needsDockerHost returning = ${isDocker || paasRequiresHost}`);
   return (isDocker || paasRequiresHost);
}

function isPaaS(answers, cmdLnInput) {
   if (cmdLnInput !== undefined) {
      return (answers.target === `paas` ||
         cmdLnInput.target === `paas` ||
         answers.target === `acilinux` ||
         cmdLnInput.target === `acilinux` ||
         answers.target === `dockerpaas` ||
         cmdLnInput.target === `dockerpaas`);
   } else {
      return (answers.target === `paas` ||
         answers.target === `acilinux` ||
         answers.target === `dockerpaas`);
   }
}

function isVSTS(instance) {
   return instance.toLowerCase().match(/http/) === null;
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

   var vstsURL = `https://${instance}.visualstudio.com`;

   if (forRM) {
      vstsURL = `https://${instance}.vsrm.visualstudio.com`;
   }

   if (includeCollection) {
      vstsURL += `/DefaultCollection`;
   }

   return vstsURL;
}

module.exports = {

   // Exports the portions of the file we want to share with files that require
   // it.

   isVSTS: isVSTS,
   isPaaS: isPaaS,
   getPools: getPools,
   tokenize: tokenize,
   isDocker: isDocker,
   encodePat: encodePat,
   findQueue: findQueue,
   findBuild: findBuild,
   getFullURL: getFullURL,
   logMessage: logMessage,
   getTargets: getTargets,
   getAppTypes: getAppTypes,
   checkStatus: checkStatus,
   findProject: findProject,
   findRelease: findRelease,
   validateTFS: validateTFS,
   isDockerHub: isDockerHub,
   getAzureSubs: getAzureSubs,
   findAzureSub: findAzureSub,
   getPATPrompt: getPATPrompt,
   tryFindBuild: tryFindBuild,
   addUserAgent: addUserAgent,
   getUserAgent: getUserAgent,
   needsRegistry: needsRegistry,
   tryFindRelease: tryFindRelease,
   reconcileValue: reconcileValue,
   tryFindProject: tryFindProject,
   validateGroupID: validateGroupID,
   extractInstance: extractInstance,
   needsDockerHost: needsDockerHost,
   validateAzureSub: validateAzureSub,
   getInstancePrompt: getInstancePrompt,
   getImageNamespace: getImageNamespace,
   validateDockerHost: validateDockerHost,
   validateAzureSubID: validateAzureSubID,
   validatePortMapping: validatePortMapping,
   validateDockerHubID: validateDockerHubID,
   getDefaultPortMapping: getDefaultPortMapping,
   validateAzureTenantID: validateAzureTenantID,
   validateDockerRegistry: validateDockerRegistry,
   validateApplicationName: validateApplicationName,
   findAzureServiceEndpoint: findAzureServiceEndpoint,
   getDockerRegistryServer: getDockerRegistryServer,
   findDockerServiceEndpoint: findDockerServiceEndpoint,
   validateDockerHubPassword: validateDockerHubPassword,
   validateServicePrincipalID: validateServicePrincipalID,
   validateServicePrincipalKey: validateServicePrincipalKey,
   tryFindAzureServiceEndpoint: tryFindAzureServiceEndpoint,
   validatePersonalAccessToken: validatePersonalAccessToken,
   tryFindDockerServiceEndpoint: tryFindDockerServiceEndpoint,
   validateDockerCertificatePath: validateDockerCertificatePath,
   findDockerRegistryServiceEndpoint: findDockerRegistryServiceEndpoint,
   tryFindDockerRegistryServiceEndpoint: tryFindDockerRegistryServiceEndpoint
};