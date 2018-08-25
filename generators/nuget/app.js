// This is the code that deals with TFS
const async = require('async');
const request = require('request');
const util = require('../app/utility');

function run(args, gen, done) {
   'use strict';

   var teamProject = {};
   var nuGetEndpoint = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         findOrCreateNuGetServiceEndpoint(args.tfs, teamProject.id, args.apiKey, token, gen, function (err, ep) {
            nuGetEndpoint = ep;
            mainSeries(err, nuGetEndpoint);
         });
      }],
      function (err, results) {
         // This is just for test and will be undefined during normal use
         if (done) {
            done(err);
         }

         if (err) {
            // To get the stacktrace run with the --debug built-in option when 
            // running the generator.
            gen.log.error(err.message);
         }
      }
   );
}

function findOrCreateNuGetServiceEndpoint(account, projectId, apiKey, token, gen, callback) {
   'use strict';

   util.tryFindNuGetServiceEndpoint(account, projectId, token, gen, function (e, ep) {
      if (e) {
         callback(e, null);
      } else {
         if (!ep) {
            createNuGetServiceEndpoint(account, projectId, apiKey, token, gen, callback);
         } else {
            gen.log.ok('Found NuGet Service Endpoint');
            callback(e, ep);
         }
      }
   });
}

function createNuGetServiceEndpoint(account, projectId, apiKey, token, gen, callback) {
   'use strict';

   gen.log.ok('Creating NuGet Service Endpoint');

   var options = util.addUserAgent({
      method: 'POST',
      headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
      json: true,
      url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
      qs: { 'api-version': util.SERVICE_ENDPOINTS_API_VERSION },
      body: {
         authorization:
         {
            parameters: {
               nugetkey: apiKey
            },
            scheme: 'None'
         },
         data: {},
         name: 'PowerShell Gallery',
         type: 'externalnugetfeed',
         url: 'https://www.powershellgallery.com/api/v2/package'
      }
   });

   request(options, function (error, response, body) {
      // Check the response for errors
      if (response.statusCode >= 400) {
         // To get the stacktrace run with the --debug built-in option when 
         // running the generator.

         gen.log.error(response.body.message.replace(/\r\n/g, " "));
         gen.log.error('Make sure you have Package Management enabled.');
      }

      callback(error, body);
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreateNuGetServiceEndpoint: findOrCreateNuGetServiceEndpoint
};