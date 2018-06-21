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
            // Help extension of yeoman generators by bundling arguments
            let objs = {
               "tfs": args.tfs,
               "teamProject": teamProject,
               "token": token,
               "queueId": queueId,
               "dockerEndpoint": dockerEndpoint,
               "dockerRegistryEndpoint": dockerRegistryEndpoint,
               "dockerRegistryId": args.dockerRegistryId,
               "buildJson": args.buildJson,
               "target": args.target,
               "kubeEndpoint": args.kubeEndpoint,
               "serviceEndpoint": args.serviceEndpoint
            };
            
            findOrCreateBuild(objs, gen, mainSeries);
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

function findOrCreateBuild(args, gen, callback) {

   'use strict';

   let account = args.tfs;
   let teamProject = args.teamProject;
   let token = args.token;
   let target = args.target;

   util.tryFindBuild(account, teamProject, token, target, function (e, bld) {
      if (e) {
         callback(e);
      }

      if (!bld) {
         createBuild(args, gen, callback);
      } else {
         gen.log(`+ Found build definition`);
         callback(e, bld);
      }
   });
}

function createBuild(args, gen, callback) {
   'use strict';

   let target = args.target;
   let teamProject = args.teamProject;
   let dockerRegistryId = args.dockerRegistryId;
   let dockerRegistryEndpoint = args.dockerRegistryEndpoint;
   let filename = args.buildJson;
   let token = args.token;
   let account = args.tfs;

   let buildDefName = util.getBuildDefName(target, teamProject.name);

   gen.log(`+ Creating ${buildDefName} build definition`);

   // Qualify the image name with the dockerRegistryId for docker hub
   // or the server name for other registries. 
   let dockerNamespace = util.getImageNamespace(dockerRegistryId, dockerRegistryEndpoint);

   // Load the template and replace values.
   var contents = fs.readFileSync(filename, 'utf8');
   let tokens = getBuildTokens(args, buildDefName, dockerNamespace);

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
         gen.env.error("x " + response.body.message.replace('\n', ' '));
      }

      callback(error, body);
   });
}

function getBuild(args, callback) {
   let build = ``;

   let pat = util.encodePat(args.pat);
   let kubeDeployment = util.kubeDeployment(args.target);

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
         if(result){
            let argument = kubeDeployment ? kubeDeployment : args.type;
            build = `vsts_${argument}_build.json`;
         }
          else {
            build = `tfs_${args.type}_build.json`;
         }

         callback(e, build);
      });
   }
}

function getBuildTokens(args, buildDefName, dockerNamespace) {
   let tokens = {
      '{{BuildDefName}}': buildDefName,
      '{{dockerRegistryId}}': dockerNamespace
   };
   
   for (let key in args) {
      let val = args[key];
      switch(key){
         case "tfs":
            tokens['{{TFS}}'] = val;
            break;

         case "teamProject":
            tokens['{{Project}}'] = val.name;
            tokens['{{ProjectLowerCase'] = val.name.toLowerCase();
            break;

         case "queueId":
            tokens['{{QueueId}}'] = val;
            break;

         case "dockerEndpoint":
            if (val){
               tokens['{{dockerHostEndpoint}}'] = val.id;
            }
            break;

         case "dockerRegistryEndpoint":
            if (val){
               tokens['{{dockerRegistryEndpoint}}'] = val.id;         
            }
            break;
         case "kubeEndpoint":
            tokens['{{KubeEndpoint}}'] = val;
            break;
         case "serviceEndpoint":
            tokens['{{ServiceEndpoint}}'] = val;
            break;
      };
   };

      return tokens;

};

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   getBuild: getBuild,
   findOrCreateBuild: findOrCreateBuild
};