// This is the code that deals with TFS
const async = require('async');
const uuidV4 = require('uuid/v4');
const request = require('request');
const util = require('../app/utility');

function run(args, gen, done) {
   'use strict';

   var teamProject = {};
   var packageFeed = {};
   var token = util.encodePat(args.pat);

   async.series([
      function (mainSeries) {
         util.findProject(args.tfs, args.project, token, gen, function (err, tp) {
            teamProject = tp;
            mainSeries(err, tp);
         });
      },
      function (mainSeries) {
         findOrCreatePackageFeed(args.tfs, teamProject, token, gen, function (err, feed) {
            packageFeed = feed;
            mainSeries(err, packageFeed);
         });
      }],
      function (err) {
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

function findOrCreatePackageFeed(account, project, token, gen, callback) {
   'use strict';

   util.tryFindPackageFeed(account, project.name, token, gen, function (e, feed) {
      if (e) {
         callback(e, null);
      } else {
         if (!feed) {
            createPackageFeed(account, project, token, gen, callback);
         } else {
            gen.log.ok('Found Package Feed');
            callback(e, feed);
         }
      }
   });
}

function createPackageFeed(account, project, token, gen, callback) {
   'use strict';

   gen.log.ok(`Creating ${project.name} package feed`);

   let err = null;
   let contributorsGroup;
   let projectAdminGroup;
   let serviceIdentity;
   let buildIdentity;

   // First we have to find all the accounts that need to be granted 
   // permissions.
   async.parallel([
      function (inParallel) {
         let options = util.addUserAgent({
            headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
            url: `${util.getFullURL(account, false, 'vssps')}/_apis/Groups`,
            json: true,
            qs: { 'scopeIds': project.id }
         });

         request(options, function (error, response, body) {
            // Check the response for errors
            if (response.statusCode >= 400) {
               // To get the stacktrace run with the --debug built-in option when 
               // running the generator.
               gen.env.error("x " + response.body.message.replace('\n', ' '));
            }

            let tmp = body.find(function (i) {
               return i.ProviderDisplayName.toLowerCase().endsWith('contributors');
            });

            if (!tmp) {
               err = { message: 'Could not find Contributors Group' };
            } else {
               contributorsGroup = `${tmp.Descriptor.IdentityType};${tmp.Descriptor.Identifier}`;
               serviceIdentity = tmp.Properties.SecuringHostId;

               tmp = body.find(function (i) {
                  return i.ProviderDisplayName.toLowerCase().endsWith('project administrators');
               });

               if (!tmp) {
                  err = { message: 'Could not find Contributors Group' };
               } else {
                  projectAdminGroup = `${tmp.Descriptor.IdentityType};${tmp.Descriptor.Identifier}`;
               }
            }

            inParallel(null, undefined);
         });
      },
      function (inParallel) {
         var options = util.addUserAgent({
            headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
            url: `${util.getFullURL(account, false, 'vssps')}/_apis/graph/users`,
            json: true
         });

         request(options, function (error, response, body) {
            // Check the response for errors
            if (response.statusCode >= 400) {
               // To get the stacktrace run with the --debug built-in option when 
               // running the generator.
               gen.env.error("x " + response.body.message.replace('\n', ' '));
            }

            let tmp = body.value.find(function (i) {
               return i.domain.toLowerCase() === 'build';
            });

            buildIdentity = tmp.principalName;

            inParallel(null, undefined);
         });
      }
   ], function (err) {

      if (err) {
         // To get the stacktrace run with the --debug built-in option when 
         // running the generator.
         gen.env.error(err.message);
      }

      var options = util.addUserAgent({
         method: 'POST',
         headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
         json: true,
         url: `${util.getFullURL(account, false, 'feeds')}/_apis/packaging/feeds`,
         qs: { 'api-version': util.PACKAGE_FEEDS_API_VERSION },
         body: {
            name: project.name,
            description: 'Feed created by Yo Team for module testing',
            hideDeletedPackageVersions: true,
            permissions: [
               {
                  // Project Collection Build Service
                  identityDescriptor: `Microsoft.TeamFoundation.ServiceIdentity;${serviceIdentity}:Build:${buildIdentity}`,
                  role: 3
               },
               {
                  identityDescriptor: projectAdminGroup,
                  role: 4
               },
               {
                  identityDescriptor: contributorsGroup,
                  role: 3
               }
            ],
            upstreamEnabled: true,
            upstreamSources: [
               {
                  id: uuidV4(),
                  name: "npmjs",
                  protocol: "npm",
                  location: "https://registry.npmjs.org/",
                  upstreamSourceType: 1
               },
               {
                  id: uuidV4(),
                  name: "nuget.org",
                  protocol: "nuget",
                  location: "https://api.nuget.org/v3/index.json",
                  upstreamSourceType: 1
               }
            ]
         }
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
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreatePackageFeed: findOrCreatePackageFeed
};