// This is the code that deals with TFS
const async = require('async');
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
         findOrCreatePackageFeed(args.tfs, teamProject.id, token, gen, function (err, feed) {
            packageFeed = feed;
            mainSeries(err, packageFeed);
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

function findOrCreatePackageFeed(account, projectId, token, gen, callback) {
   'use strict';

   util.tryFindPackageFeed(account, projectId, token, gen, function (e, feed) {
      if (e) {
         callback(e, null);
      } else {
         if (!feed) {
            createPackageFeed(account, projectId, token, gen, callback);
         } else {
            gen.log('+ Found Package Feed');
            callback(e, feed);
         }
      }
   });
}

function createPackageFeed(account, projectId, token, gen, callback) {
   'use strict';

   gen.log('+ Creating Package Feed');

   var options = util.addUserAgent({
      method: 'POST',
      headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
      json: true,
      url: `${util.getFullURL(account, false, 'feeds')}/_apis/packaging/feeds`,
      qs: { 'api-version': util.PACKAGE_FEEDS_API_VERSION },
      body: {
         name: 'ModuleFeed',
         description: 'Feed created by Yo Team for module testing',
         hideDeletedPackageVersions: true
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
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreatePackageFeed: findOrCreatePackageFeed
};