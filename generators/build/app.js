// This is the code that deals with TFS
const fs = require('fs');
const async = require('async');
const request = require('request');
const util = require('../app/utility');

const BUILD_API_VERSION = '2.0';

function run(args, gen, done) {
   'use strict';

   var queueId = 0;
   var teamProject = {};
   var dockerEndpoint = {};
   var dockerRegistryEndpoint = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         async.parallel([
            function (inParallel) {
               util.findQueue(args.queue, args.tfs, teamProject, token, function (err, id) {
                  queueId = id;
                  inParallel(err, id);
               });
            },
            function (inParallel) {
               if (args.target === `docker`) {
                  util.findDockerServiceEndpoint(args.tfs, teamProject.id, args.dockerHost, token, gen, function (err, ep) {
                     dockerEndpoint = ep;
                     inParallel(err, dockerEndpoint);
                  });
               } else {
                  inParallel(null, undefined);
               }
            },
            function (inParallel) {
               if (args.target === `docker`) {
                  util.findDockerRegistryServiceEndpoint(args.tfs, teamProject.id, args.dockerRegistry, token, function (err, ep) {
                     dockerRegistryEndpoint = ep;
                     inParallel(err, dockerRegistryEndpoint);
                  });
               } else {
                  inParallel(null, undefined);
               }
            }
         ], mainSeries);
      },
      function (mainSeries) {
         findOrCreateBuild(args.tfs, teamProject, token, queueId, dockerEndpoint, dockerRegistryEndpoint, args.dockerRegistryId, args.buildJson, args.target, gen, mainSeries);
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

function findOrCreateBuild(account, teamProject, token, queueId,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   util.tryFindBuild(account, teamProject, token, target, function (e, bld) {
      if (e) {
         callback(e);
      }

      if (!bld) {
         createBuild(account, teamProject, token, queueId,
            dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
            filename, target, gen, callback);
      } else {
         gen.log(`+ Found build definition`);
         callback(e, bld);
      }
   });
}

function createBuild(account, teamProject, token, queueId,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   gen.log('+ Creating CI build definition');

   // Load the template and replace values.
   var contents = fs.readFileSync(filename, 'utf8');
   var tokens = {
      '{{BuildDefName}}': target === 'docker' ? `${teamProject.name}-Docker-CI` : `${teamProject.name}-CI`,
      '{{TFS}}': account,
      '{{Project}}': teamProject.name,
      '{{QueueId}}': queueId,
      '{{dockerHostEndpoint}}': dockerHostEndpoint ? dockerHostEndpoint.id : null,
      '{{dockerRegistryEndpoint}}': dockerRegistryEndpoint ? dockerRegistryEndpoint.id : null,
      '{{dockerRegistryId}}': dockerRegistryId ? dockerRegistryId.toLowerCase() : null,
      '{{ProjectLowerCase}}': teamProject.name.toLowerCase()
   };

   contents = util.tokenize(contents, tokens);

   // Validates my contents is valid JSON and stripes all the new lines
   var payload = JSON.parse(contents);

   var options = util.addUserAgent({
      method: 'POST',
      headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
      json: true,
      url: `${util.getFullURL(account)}/${teamProject.id}/_apis/build/definitions`,
      qs: { 'api-version': BUILD_API_VERSION },
      body: payload
   });

   request(options, function (error, response, body) {
      // Check the response for errors
      if (response.statusCode >= 400) {
         // To get the stacktrace run with the --debug built-in option when 
         // running the generator.
         gen.env.error("x " + response.body.message.replace('\n', ' '));
      }

      callback(error, body);
   });
}

function getBuild(args) {
   var build = ``;

   if (args.type === `asp`) {
      if (args.target === `docker`) {
         if (util.isVSTS(args.tfs)) {
            build = `vsts_asp_docker_build.json`;
         } else {
            build = `tfs_asp_docker_build.json`;
         }
      } else {
         if (util.isVSTS(args.tfs)) {
            build = `vsts_asp_build.json`;
         } else {
            build = `tfs_asp_build.json`;
         }
      }
   } else if (args.type === `node`) {
      if (args.target === `docker`) {
         build = `node_docker_build.json`;
      } else {
         build = `node_build.json`;
      }
   } else {
      if (args.target === `docker`) {
         build = `java_docker_build.json`;
      } else {
         build = `java_build.json`;
      }
   }

   return build;
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   getBuild: getBuild,
   findOrCreateBuild: findOrCreateBuild
};