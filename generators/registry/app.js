// This is the code that deals with TFS
const async = require('async');
const request = require('request');
const util = require('../app/utility');

const SERVICE_ENDPOINTS_API_VERSION = '3.0-preview.1';

function run(args, gen, done) {
   'use strict';

   var teamProject = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         findOrCreateDockerRegistryServiceEndpoint(args.tfs, teamProject.id,
            args.dockerRegistry, args.dockerRegistryId, args.dockerRegistryPassword, args.dockerRegistryEmail, token, gen, mainSeries);
      }],
      function (err, results) {
         // This is just for test and will be undefined during normal use
         if (done) {
            done(err);
         }

         if (err) {
            // To get the stacktrace run with the --debug built-in option when 
            // running the generator.
            gen.env.error(err.message);
         }
      });
}

function findOrCreateDockerRegistryServiceEndpoint(
   account,
   projectId,
   dockerRegistry,
   dockerRegistryId,
   dockerRegistryPassword,
   dockerRegistryEmail,
   token,
   gen,
   callback) {
   'use strict';

   // There is nothing to do
   if (!dockerRegistry) {
      callback(null, null);
      return;
   }

   util.tryFindDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, token, function (e, ep) {
      if (e) {
         callback(e, null);
      } else {
         if (!ep) {
            createDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, dockerRegistryId, dockerRegistryPassword, dockerRegistryEmail, token, gen, callback);
         } else {
            gen.log('+ Found Docker Registry Service Endpoint');
            callback(e, ep);
         }
      }
   });
}

function createDockerRegistryServiceEndpoint(account, projectId, dockerRegistry, dockerRegistryId, dockerRegistryPassword, dockerRegistryEmail, token, gen, callback) {
   'use strict';

   gen.log('+ Creating Docker Registry Service Endpoint');

   var options = util.addUserAgent({
      method: 'POST',
      headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
      json: true,
      url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
      qs: { 'api-version': SERVICE_ENDPOINTS_API_VERSION },
      body: {
         authorization:
         {
            parameters: {
               email: dockerRegistryEmail,
               password: dockerRegistryPassword,
               registry: dockerRegistry,
               username: dockerRegistryId
            },
            scheme: 'UsernamePassword'
         },
         data: {},
         name: 'Docker Registry',
         type: 'dockerregistry',
         url: 'http://hub.docker.com'
      }
   });

   request(options, function (error, response, body) {
      // Check the response for errors
      if (response.statusCode >= 400) {
         // To get the stacktrace run with the --debug built-in option when 
         // running the generator.
         gen.log("! Make sure the Docker Integration extension is installed");
         gen.env.error("x " + response.body.message.replace('\n', ' '));
      }

      callback(error, body);
   });
}

//
// Exports the portions of the file we want to share with files that require 
// it.
//
module.exports = {
   run: run,
   findOrCreateDockerRegistryServiceEndpoint: findOrCreateDockerRegistryServiceEndpoint
};