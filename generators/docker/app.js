// This is the code that deals with TFS
const fs = require('fs');
const path = require('path');
const async = require('async');
const request = require('request');
const util = require('../app/utility');

const SERVICE_ENDPOINTS_API_VERSION = '3.0-preview.1';

function run(args, gen, done) {
   'use strict';

   var teamProject = {};
   var dockerEndpoint = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         findOrCreateDockerServiceEndpoint(args.tfs, teamProject.id, args.dockerHost, args.dockerCertPath, token, gen, function (err, ep) {
            dockerEndpoint = ep;
            mainSeries(err, dockerEndpoint);
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
            gen.env.error(err.message);
         }
      });
}

function findOrCreateDockerServiceEndpoint(account, projectId, dockerHost, dockerCertPath, token, gen, callback) {
   'use strict';

   // There is nothing to do
   if (!dockerHost) {
      callback(null, null);
      return;
   }

   util.tryFindDockerServiceEndpoint(account, projectId, dockerHost, token, gen, function (e, ep) {
      if (e) {
         callback(e, null);
      } else {
         if (!ep) {
            createDockerServiceEndpoint(account, projectId, dockerHost, dockerCertPath, token, gen, callback);
         } else {
            gen.log('+ Found Docker Service Endpoint');
            callback(e, ep);
         }
      }
   });
}

function createDockerServiceEndpoint(account, projectId, dockerHost, dockerCertPath, token, gen, callback) {
   'use strict';

   gen.log('+ Creating Docker Service Endpoint');

   // Find the contents of the files.
   var ca = path.join(dockerCertPath, 'ca.pem');
   var key = path.join(dockerCertPath, 'key.pem');
   var cert = path.join(dockerCertPath, 'cert.pem');

   var caContents, keyContents, certContents;

   async.map([ca, key, cert], fs.readFile, function (err, results) {
      caContents = results[0].toString();
      keyContents = results[1].toString();
      certContents = results[2].toString();

      var options = {
         method: 'POST',
         headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
         json: true,
         url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
         qs: { 'api-version': SERVICE_ENDPOINTS_API_VERSION },
         body: {
            authorization:
            {
               parameters: {
                  cacert: caContents,
                  cert: certContents,
                  certificate: '',
                  key: keyContents
               },
               scheme: 'Certificate'
            },
            data: {},
            name: 'Docker',
            type: 'dockerhost',
            url: dockerHost
         }
      };

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
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreateDockerServiceEndpoint: findOrCreateDockerServiceEndpoint
};