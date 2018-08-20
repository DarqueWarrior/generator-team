// This is the code that deals with TFS
const fs = require('fs');
const async = require('async');
const request = require('request');
const util = require('../app/utility');

function run(args, gen, done) {
   'use strict';

   var teamProject;
   var queues = null;
   var dockerEndpoint;
   var dockerRegistryEndpoint;
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
               util.findAllQueues(args.tfs, teamProject, token, function (err, allQueues) {
                  queues = allQueues;
                  inParallel(err, queues);
               });
            },
            function (inParallel) {
               if (util.needsDockerHost({}, args)) {
                  util.findDockerServiceEndpoint(args.tfs, teamProject.id, args.dockerHost, token, gen, function (err, ep) {
                     dockerEndpoint = ep;
                     inParallel(err, dockerEndpoint);
                  });
               } else {
                  inParallel(null, undefined);
               }
            },
            function (inParallel) {
               if (util.needsRegistry({}, args)) {
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

         // PowerShell requires the latest version of build because it uses
         // stages. We are setting target to powershell here so it can be
         // tested in findOrCreateBuild below
         if (args.type === 'powershell') {            
            args.target = args.type;

            // Pass in all the queues because we need one macOS, Linux and Windows for PowerShell
            findOrCreateBuild(args.tfs, teamProject, token, queues, dockerEndpoint, dockerRegistryEndpoint, args.dockerRegistryId, args.buildJson, args.target, gen, mainSeries);
         } else {
            // find just the queue they selected
            var queue = queues.find(function (i) {
               return i.name.toLowerCase() === args.queue.toLowerCase();
            });

            findOrCreateBuild(args.tfs, teamProject, token, queue, dockerEndpoint, dockerRegistryEndpoint, args.dockerRegistryId, args.buildJson, args.target, gen, mainSeries);
         }
      }
   ],
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
      }
   );
}

function findOrCreateBuild(account, teamProject, token, queue,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   util.tryFindBuild(account, teamProject, token, target, function (e, bld) {
      if (e) {
         callback(e);
      }

      if (!bld) {
         createBuild(account, teamProject, token, queue,
            dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
            filename, target, gen, callback);
      } else {
         gen.log(`+ Found build definition`);
         callback(e, bld);
      }
   });
}

function createBuild(account, teamProject, token, queues,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   let buildDefName = util.isDocker(target) ? `${teamProject.name}-Docker-CI` : `${teamProject.name}-CI`;

   gen.log(`+ Creating ${buildDefName} build definition`);

   let windows;
   let linux;
   let mac;
   let selected;

   if (Array.isArray(queues)) {
      // We only need the id
      let temp = queues.find(function (i) { return i.name.toLowerCase().indexOf('hosted vs2017') !== -1; });
      windows = temp.id;

      temp = queues.find(function (i) { return i.name.toLowerCase().indexOf('hosted linux') !== -1; });
      linux = temp.id;

      temp = queues.find(function (i) { return i.name.toLowerCase().indexOf('hosted macos') !== -1; });
      mac = temp.id;

      selected = windows;
   } else {
      windows = queues;
      linux = queues;
      mac = queues;
      selected = queues;
   }

   // Qualify the image name with the dockerRegistryId for docker hub
   // or the server name for other registries. 
   let dockerNamespace = util.getImageNamespace(dockerRegistryId, dockerRegistryEndpoint);

   // Load the template and replace values.
   var contents = fs.readFileSync(filename, 'utf8');
   var tokens = {
      '{{BuildDefName}}': buildDefName,
      '{{TFS}}': account,
      '{{Project}}': teamProject.name,
      '{{QueueId}}': selected,
      '{{WindowsQueueId}}': windows,
      '{{macOSQueueId}}': mac,
      '{{LinuxQueueId}}': linux,
      '{{dockerHostEndpoint}}': dockerHostEndpoint ? dockerHostEndpoint.id : ``,
      '{{dockerRegistryEndpoint}}': dockerRegistryEndpoint ? dockerRegistryEndpoint.id : ``,
      '{{dockerRegistryId}}': dockerNamespace,
      '{{ProjectLowerCase}}': teamProject.name.toLowerCase()
   };

   contents = util.tokenize(contents, tokens);

   // Validates my contents is valid JSON and stripes all the new lines
   var payload = JSON.parse(contents);

   // PowerShell build has to be uploaded with latest API version
   let apiVersion = util.BUILD_API_VERSION

   if (target === 'powershell') {
      apiVersion = util.VSTS_BUILD_API_VERSION
   }

   var options = util.addUserAgent({
      method: 'POST',
      headers: {
         'cache-control': 'no-cache',
         'content-type': 'application/json',
         'authorization': `Basic ${token}`
      },
      json: true,
      url: `${util.getFullURL(account)}/${teamProject.id}/_apis/build/definitions`,
      qs: {
         'api-version': apiVersion
      },
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

function getBuild(args, callback) {
   var build = ``;

   let pat = util.encodePat(args.pat);

   if (util.isDocker(args.target)) {
      util.isTFSGreaterThan2017(args.tfs, pat, (e, result) => {
         if (result) {
            build = `vsts_${args.type}_docker_build.json`;
         } else {
            build = `tfs_${args.type}_docker_build.json`;
         }

         callback(e, build);
      });
   } else {
      util.isTFSGreaterThan2017(args.tfs, pat, (e, result) => {
         if (result) {
            build = `vsts_${args.type}_build.json`;
         } else {
            build = `tfs_${args.type}_build.json`;
         }

         callback(e, build);
      });
   }
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   getBuild: getBuild,
   findOrCreateBuild: findOrCreateBuild
};