// This is the code that deals with TFS
const fs = require('fs');
const async = require('async');
const request = require('request');
const util = require('../app/utility');

function run(args, gen, done) {
   'use strict';

   var queueId = 0;
   var teamProject;
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
                  util.findQueue(args.queue, args.tfs, teamProject, token, function (err, id) {
                     queueId = id;
                     inParallel(err, id);
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
            findOrCreateBuild(args.tfs, teamProject, args.packageName, token, queueId, dockerEndpoint, dockerRegistryEndpoint, args.dockerRegistryId, args.buildJson, args.target, gen, mainSeries);
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
      });
}

function findOrCreateBuild(account, teamProject, packageName, token, queueId,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   util.tryFindBuild(account, teamProject, token, target, function (e, bld) {
      if (e) {
         callback(e);
      }

      if (!bld) {
         createBuild(account, teamProject, packageName, token, queueId,
            dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
            filename, target, gen, callback);
      } else {
         gen.log(`+ Found build definition`);
         callback(e, bld);
      }
   });
}

function createBuild(account, teamProject, packageName, token, queueId,
   dockerHostEndpoint, dockerRegistryEndpoint, dockerRegistryId,
   filename, target, gen, callback) {
   'use strict';

   let buildDefName = util.isDocker(target) ? `${teamProject.name}-Docker-CI` : `${teamProject.name}-CI`;

   gen.log(`+ Creating ${buildDefName} build definition`);

   // Qualify the image name with the dockerRegistryId for docker hub
   // or the server name for other registries. 
   let dockerNamespace = util.getImageNamespace(dockerRegistryId, dockerRegistryEndpoint);

   // Load the template and replace values.
   var contents = fs.readFileSync(filename, 'utf8');
   var tokens = {
      '{{BuildDefName}}': buildDefName,
      '{{PackageName}}': packageName,
      '{{TFS}}': account,
      '{{Project}}': teamProject.name,
      '{{QueueId}}': queueId,
      '{{dockerHostEndpoint}}': dockerHostEndpoint ? dockerHostEndpoint.id : ``,
      '{{dockerRegistryEndpoint}}': dockerRegistryEndpoint ? dockerRegistryEndpoint.id : ``,
      '{{dockerRegistryId}}': dockerNamespace,
      '{{ProjectLowerCase}}': teamProject.name.toLowerCase()
   };

   contents = util.tokenize(contents, tokens);

   // Validates my contents is valid JSON and stripes all the new lines
   var payload = JSON.parse(contents);

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
         'api-version': util.BUILD_API_VERSION
      },
      body: payload
   });

   request(options, function (error, response, body) {
      // Check the response for errors
      if (response.statusCode >= 400) {
         // To get the stacktrace run with the --debug built-in option when 
         // running the generator.
          if(!util.isDocker(target)){
              if(body.message.includes("42284b34-be85-4034-890f-8755ad9f6249") ||
                  body.message.includes("77f3c5c9-713f-4eb6-bd73-42324109ea2e"))
              {
                  gen.log("! Make sure the Mobile App Tasks for iOS and Android extension is installed (by James Montemagno)");
              }
          }else{
              gen.env.error("x " + response.body.message.replace('\n', ' '));
          }
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