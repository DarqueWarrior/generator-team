// Collection of utility functions used by other generators. 

const fs = require('fs');
const os = require('os');
const url = require('url');
const request = require(`request`);
const package = require('../../package.json');

// The version of the API used to talk to TFS and VSTS.  In future
// versions this might be changed depending on the version of TFS/VSTS
// we are talking too.  However, the shape of the build and release
// JSON changes from version to version. The versions used below are 
// supported in TFS 2017 U3, 2018 U1 and VSTS.
const BUILD_API_VERSION = `2.0`;
const PROJECT_API_VERSION = `1.0`;
const RELEASE_API_VERSION = `3.0-preview`;
const DISTRIBUTED_TASK_API_VERSION = `3.0-preview`;
const SERVICE_ENDPOINTS_API_VERSION = `3.0-preview`;

// This location is the same as the VSTeam PowerShell module. Therefore,
// the profiles can be shared between Yo Team and the VSTeam PowerShell
// module.
const PROFILE_PATH = os.homedir() + '/vsteam_profiles.json';

var profile = null;

var logMessage = function (msg) {
   if (process.env.LOGYO === `on`) {
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

function isKubernetes(target) {
   return target === 'acs' || target === 'aks';
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

// Setting the User Agent allows these calls to be identified in the VSTS telemetry.
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

   return new Promise(function (resolve, reject) {
      let targets = [];

      if (answers.type === `custom`) {
         targets = [{
            name: `Azure`,
            value: `paas`
         }, {
            name: `Docker`,
            value: `docker`
         }, {
            name: `Both`,
            value: `dockerpaas`
         }];
      } else if (answers.type === 'kubernetes') {
         targets = [{
            name: 'Kubernetes: Azure Kubernetes Service',
            value: 'aks'
         }, {
            name: 'Kubernetes: Azure Container Services',
            value: 'acs'
         }];
      } else if (answers.type === `aspFull`) {
         targets = [{
            name: `Azure App Service`,
            value: `paas`
         }, {
            name: `Azure App Service (Deployment Slots)`,
            value: `paasslots`
         }];
      } else {
         targets = [{
            name: `Azure App Service`,
            value: `paas`
         }, {
            name: `Azure App Service (Deployment Slots)`,
            value: `paasslots`
         }, {
            name: `Azure Container Instances (Linux)`,
            value: `acilinux`
         }, {
            name: `Azure App Service Docker (Linux)`,
            value: `dockerpaas`
         }, {
            name: `Docker Host`,
            value: `docker`
         }, {
            name: 'Kubernetes: Azure Kubernetes Service',
            value: 'aks'
         }, {
            name: 'Kubernetes: Azure Container Services',
            value: 'acs'
         }];

         // TODO: Investigate if we need to remove these
         // options. I think you can offer paas and paasslots
         // for this combination. 
         if (answers.type === `java` &&
            answers.queue === `Hosted Linux Preview`) {
            // Remove Azure App Service
            targets.splice(0, 1);

            // Remove Azure App Service (Deployment Slots)
            targets.splice(0, 1);
         }
      }

      resolve(targets);
   });
}

function getAppTypes(answers) {
   // Default to languages that work on all agents
   let types = [{
      name: `.NET Core`,
      value: `asp`
   }, {
      name: `Node.js`,
      value: `node`
   }, {
      name: `Java`,
      value: `java`
   }, {
      name: 'Kubernetes: Default (nginx)',
      value: 'kubernetes'
   }
      // , {
      //    name: `Custom`,
      //    value: `custom`
      // }
   ];

   // If this is not a Linux or Mac based agent also show
   // .NET Full
   if (answers.queue.indexOf(`Linux`) === -1 &&
       answers.queue.indexOf(`macOS`) === -1 ) {
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
   return `Enter VSTS account name\n  ({account}.visualstudio.com)\n  Or full TFS URL including collection\n  (http://tfs:8080/tfs/DefaultCollection)\n  Or name of a stored Profile?`;
}

function getAcrPrompt(){
   return `Enter the Azure Container Registry (ACR) name\n  What is the name of your ACR? ({name}.azurecr.io) `;

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

function validateProfileName(input) {
   return validateRequired(input, `You must provide a profile name`);
}

function validateCustomFolder(input) {
   return validateRequired(input, `You must provide a custom template path`);
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

function validateKubeEndpoint(input) {
   return validateRequired(input, `You must provide a Kubernetes Service Endpoint`);
}

function validateAcr(input) {
   return validateRequired(input, `You must provide an Azure Container Registry login`);
}

function validateResourceGroup(input) {
   return validateRequired(input, `You must provide an Azure Resource Group`);
}

function validateImagePullSecrets(input) {
   return validateRequired(input, `You must provide an Image Pull Secret name`);

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

   // Retry connecting to VSTS. try/catch will catch the parsing error, not the request error
   request(options, function (err, res, body) {
      if (err.code === 'ECONNREFUSED') {
         console.log("Connection Refused. Trying again...");
         obj = {
            "operationStatus": {
               "state": "InProgress"
            }
         };
         callback("", obj)
      }
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
         return i.type.toLowerCase() === `dockerregistry`;
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
   // This will be true when the user selected Linux for the build queue. 
   // Because we use ARM deployment with the Hosted VS2017 queue even if
   // the user selected Linux for build the call to needsDockerHost may
   // return true for build. However, if they select Linux for build they
   // would not be prompted for a docker host and dockerHost will be empty.
   // In that case just return. When user is calling from the command line
   // and they pass in Linux they have to leave dockerHost empty.  If they
   // pass in Linux and a dockerHost they will get an error saying the 
   // docker service endpoint could not be found. That is because we did
   // not create one because the Hosted Linux build has the docker tools
   // so we don't need an external host so no service endpoint was created.
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
         return i.url.toLowerCase().startsWith(dockerHost.toLowerCase());
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
         return i.data.subscriptionName !== undefined && i.data.subscriptionName.toLowerCase() === sub.name.toLowerCase();
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
         return i.displayName.toLowerCase() === subName.toLowerCase();
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
   
   let name = getBuildDefName(target, teamProject.name);
              
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
         return i.name.toLowerCase() === name.toLowerCase();
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

function getBuildDefName(target, projectName){
   let kubeDeploy = kubeDeployment(target);
   let dockerDeploy = dockerDeployment(target);

   let buildDefName = undefined;
   switch(target){
      case kubeDeploy:
         buildDefName = `${projectName}-${kubeDeploy}-CI`;
         break;
      case dockerDeploy:
         buildDefName = `${projectName}-Docker-CI`;
         break;
      default:
         buildDefName = `${projectName}-CI`;
   }

   return buildDefName;
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

   let name = getReleaseDefName(args.target, args.teamProject.name);

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
         return i.name.toLowerCase() === name.toLowerCase();
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

function getReleaseDefName(target, projectName){

   let kubeDeploy = kubeDeployment(target);
   let dockerDeploy = dockerDeployment(target);

   let releaseDefName = undefined;
   switch(target) {
      case kubeDeploy:
         releaseDefName = `${projectName}-${kubeDeploy}-CD`;
         break;

      case dockerDeploy:
         releaseDefName = `${projectName}-Docker-CD`;
         break;

      default:
         releaseDefName = `${projectName}-CD`;
   }

   return releaseDefName;
}

function kubeDeployment(target){
   let kube = undefined;

   if (target === 'acs' || target === 'aks'){
      kube = target;
   }

   return kube;
}

function dockerDeployment(target) {
   let docker = undefined;

   if (target === `docker` || target === `dockerpaas` || target === `acilinux`){
      docker = target;
   }

   return docker;
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

function getKubeEndpoint(answers) {
   "use strict";

   let token = encodePat(answers.pat);
   let accountName = answers.tfs;
   let projectName = answers.applicationName;

   let options = {
      "method": `GET`,
      "headers": {
         "Cache-control": `no-cache`,
         "Authorization": `Basic ${token}`
      },
      "url": `https://${accountName}.visualstudio.com/${projectName}/_apis/serviceendpoint/endpoints?type=kubernetes&api-version=4.1-preview.1`,
   
   };

   return new Promise(function (resolve, reject) {
      request(options, function (e, response, body) {
         if (e) {
            reject(e);
            return;
         }

         let obj = JSON.parse(body);

         let result = [];

         // Passing in Endpoint name as display name, but saving the endpoint ID to be used later
         obj.value.forEach((endpoint) => {
            result.push({
               name: endpoint.name,
               value: endpoint.id
            });
         });

         resolve(result);
      });
   });
}

function getProfileCommands(answers) {
   "use strict";

   return [{
      name: `Add`,
      value: `add`
   }, {
      name: `List`,
      value: `list`
   }, {
      name: `Delete`,
      value: `delete`
   }];
}

function getTFSVersion(answers) {
   "use strict";

   return [{
      name: `TFS2017`,
      value: `TFS2017`
   }, {
      name: `TFS2018`,
      value: `TFS2018`
   }];
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

function loadProfiles() {

   let results = {
      error: null,
      profiles: null
   };

   if (fs.existsSync(PROFILE_PATH)) {
      try {
         results.profiles = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
      } catch (error) {
         // The file is invalid
         results.error = `Invalid file.`;
      }
   } else {
      results.error = `No profiles file.`;
   }

   return results;
}

// Reads profiles created by the VSTeam PowerShell module.
// Search ignores case.
// Yo team stores the full URL of TFS and the account name
// for VSTS.  The profile name might not match the account
// name or full URL.  So when you run Yo Team again it will
// default to the full URL or account name and fail to find
// the profile and prompt for the PAT.  Therefore, here you 
// need to seach the profile name and URL 
function searchProfiles(input) {
   let results = loadProfiles();

   if (results.profiles !== null) {
      var found = results.profiles.filter(function (i) {
         return (i.Name.toLowerCase().includes(input.toLowerCase()) || 
                 i.URL.toLowerCase().includes(input.toLowerCase())) &&
                 i.Type === `Pat`;
      });

      if (found.length > 1) {
         // Try to find the correct entry 
         found = results.profiles.filter(function (i) {
            return (i.Name.toLowerCase() === input.toLowerCase() || 
                    i.URL.toLowerCase() === input.toLowerCase());
         });
      } 

      if (found.length === 1) {
         return found[0];
      }
   }

   return null;
}

// Used to determine if we need to prompt the user for a PAT
// If the PAT was read from the profile this method returns
// false letting the prompt know it does not need to ask for 
// a PAT.
function readPatFromProfile(answers, obj) {
   if (profile) {
      // Profiles are stored 64 bit encoded
      let b = new Buffer(profile.Pat, 'base64');
      // Skip the leading :
      obj.options.pat = b.toString().substring(1);
   }
   
   // If the value was passed on the command line it will
   // not be set in answers which other prompts expect.
   // So, place it in answers now.
   answers.pat = obj.options.pat;

   return obj.options.pat === undefined;
}

function extractInstance(input) {
   profile = searchProfiles(input);

   if (profile !== null) {
      input = profile.URL;
   }

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

function needsRegistry(answers, options) {
   if (options !== undefined) {
      return (answers.target === `docker` ||
         options.target === `docker` ||
         answers.target === `acilinux` ||
         options.target === `acilinux` ||
         answers.target === `dockerpaas` ||
         options.target === `dockerpaas`);
   } else {
      return (answers.target === `docker` ||
         answers.target === `acilinux` ||
         answers.target === `dockerpaas`);
   }
}

function needsDockerHost(answers, options) {
   let isDocker;
   let paasRequiresHost;

   if (options !== undefined) {
      // If you pass in the target on the command line 
      // answers.target will be undefined so test options
      isDocker = (answers.target === `docker` || options.target === `docker`);

      // This will be true if the user did not select the Hosted Linux queue
      paasRequiresHost = (answers.target === `dockerpaas` ||
         options.target === `dockerpaas` ||
         answers.target === `acilinux` ||
         options.target === `acilinux`) &&
         ((answers.queue === undefined || answers.queue.indexOf(`Linux`) === -1) &&
            (options.queue === undefined || options.queue.indexOf(`Linux`) === -1));
   } else {
      // If you pass in the target on the command line 
      // answers.target will be undefined so test options
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
         cmdLnInput.options.target === `paas` ||
         answers.target === `paasslots` ||
         cmdLnInput.options.target === `paasslots` ||
         answers.target === `acilinux` ||
         cmdLnInput.options.target === `acilinux` ||
         answers.target === `dockerpaas` ||
         cmdLnInput.options.target === `dockerpaas`);
   } else {
      return (answers.target === `paas` ||
         answers.target === `paasslots` ||
         answers.target === `acilinux` ||
         answers.target === `dockerpaas`);
   }
}

function isVSTS(instance) {
   if (instance) {
      return instance.toLowerCase().match(/http/) === null || instance.toLowerCase().match(/visualstudio\.com/) !== null;
   }

   return false;
}

function supportsLoadTests(account, token, callback) {
   if (isVSTS(account)) {
      let pat = encodePat(token);

      // We can determine if this is 2017 or not by searching for a 
      // specific docker task.
      var options = addUserAgent({
         "method": `GET`,
         "headers": {
            "cache-control": `no-cache`,
            "authorization": `Basic ${pat}`
         },
         "url": `${getFullURL(account)}/_api/_account/GetAccountSettings?__v=5`
      });

      request(options, function (error, response, body) {
         if (error) {
            callback(error, undefined);
         } else if (response.statusCode >= 200 && response.statusCode < 300) {
            let obj = {};
            let result = true;

            try {
               obj = JSON.parse(body);

               if (obj.accountRegion === `West Central US`) {
                  result = false;
               }

               callback(undefined, result);
            } catch (error) {
               // This a HTML page with an error message.
               err = error;
               console.log(body);
               callback(err, undefined);
            }
         } else {
            callback(undefined, undefined);
         }
      });
   } else {
      callback(undefined, false);
   }
}

//
// token must be encoded before calling this function. 
//
function isTFSGreaterThan2017(account, token, callback) {
   if (isVSTS(account)) {
      callback(undefined, true);
   } else {
      // We can determine if this is 2017 or not by reviewing
      // the values from teh serviceLevel
      var options = addUserAgent({
         "method": `GET`,
         "headers": {
            "cache-control": `no-cache`,
            "authorization": `Basic ${token}`
         },
         "url": `${getFullURL(account)}/_apis/servicelevel`
      });

      request(options, function (error, response, body) {
         if (error) {
            callback(error, undefined);
         } else if (response.statusCode === 200) {

            var obj = JSON.parse(body);

            if (obj.configurationDatabaseServiceLevel.startsWith(`Dev15`)) {
               callback(undefined, false);
            } else {
               callback(undefined, true);
            }
         } else {
            callback(undefined, true);
         }
      });
   }
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
   PROFILE_PATH: PROFILE_PATH,
   BUILD_API_VERSION: BUILD_API_VERSION,
   PROJECT_API_VERSION: PROJECT_API_VERSION,
   RELEASE_API_VERSION: RELEASE_API_VERSION,
   DISTRIBUTED_TASK_API_VERSION: DISTRIBUTED_TASK_API_VERSION,
   SERVICE_ENDPOINTS_API_VERSION: SERVICE_ENDPOINTS_API_VERSION,

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
   loadProfiles: loadProfiles,
   getPATPrompt: getPATPrompt,
   tryFindBuild: tryFindBuild,
   addUserAgent: addUserAgent,
   getUserAgent: getUserAgent,
   needsRegistry: needsRegistry,
   getTFSVersion: getTFSVersion,
   tryFindRelease: tryFindRelease,
   reconcileValue: reconcileValue,
   searchProfiles: searchProfiles,
   tryFindProject: tryFindProject,
   validateGroupID: validateGroupID,
   extractInstance: extractInstance,
   needsDockerHost: needsDockerHost,
   validateAzureSub: validateAzureSub,
   getInstancePrompt: getInstancePrompt,
   getImageNamespace: getImageNamespace,
   supportsLoadTests: supportsLoadTests,
   getProfileCommands: getProfileCommands,
   readPatFromProfile: readPatFromProfile,
   validateDockerHost: validateDockerHost,
   validateAzureSubID: validateAzureSubID,
   validatePortMapping: validatePortMapping,
   validateProfileName: validateProfileName,
   validateDockerHubID: validateDockerHubID,
   isTFSGreaterThan2017: isTFSGreaterThan2017,
   validateCustomFolder: validateCustomFolder,
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
   tryFindDockerRegistryServiceEndpoint: tryFindDockerRegistryServiceEndpoint,
   getKubeEndpoint: getKubeEndpoint,
   validateKubeEndpoint: validateKubeEndpoint,
   kubeDeployment: kubeDeployment,
   dockerDeployment: dockerDeployment,
   getBuildDefName: getBuildDefName,
   getReleaseDefName: getReleaseDefName,
   validateAcr: validateAcr,
   getAcrPrompt: getAcrPrompt,
   validateResourceGroup: validateResourceGroup,
   isKubernetes: isKubernetes
};
