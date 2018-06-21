// This is the code that deals with TFS
const async = require('async');
const request = require('request');
const util = require('../app/utility');

function run(args, gen, done) {
   'use strict';

   var azureSub = {
      id: args.azureSubId,
      name: args.azureSub,
      tenantId: args.tenantId,
      servicePrincipalId: args.servicePrincipalId,
      servicePrincipalKey: args.servicePrincipalKey
   };
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
         if (util.isVSTS(args.tfs)) {
            util.findAzureSub(args.tfs, args.azureSub, token, gen, function (err, sub) {
               if (sub === undefined) {
                  err = { message: `${args.azureSub} Azure subscription not found` };
                  gen.log.error(`${args.azureSub} Azure subscription not found.`);
               } else {
                  azureSub.name = sub.displayName;
                  azureSub.id = sub.subscriptionId;
                  azureSub.tenantId = sub.subscriptionTenantId;

                  gen.log(`+ Found ${args.azureSub} Azure subscription`);
               }
               mainSeries(err, sub);
            });
         } else {
            mainSeries(null, null);
         }
      },
      function (mainSeries) {
         findOrCreateAzureServiceEndpoint(args.tfs, teamProject.id, azureSub, token, gen, mainSeries);
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

function findOrCreateAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   'use strict';

   util.tryFindAzureServiceEndpoint(account, projectId, sub, token, gen, function (e, ep) {
      if (e) {
         // An error occurred trying to contact TFS
         callback(e, null);
      } else {
         // TFS responded
         if (ep === undefined) {
            // The endpoint was not found so create it
            createAzureServiceEndpoint(account, projectId, sub, token, gen, callback);
         } else {
            gen.log(`+ Found Azure Service Endpoint '${sub.name}'`);
            callback(e, ep);
         }
      }
   });
}

function createAzureServiceEndpoint(account, projectId, sub, token, gen, callback) {
   "use strict";

   gen.log(`+ Creating ${sub.name} Azure Service Endpoint`);

   // If the user provides the servicePrincipalId set the creationMode to 
   // manual. If you try and use creation mode of automatic and pass in
   // the servicePrincipalId you will get an error.
   let creationMode = (sub.servicePrincipalId) ? `Manual` : `Automatic`;

   var options = util.addUserAgent({
      method: 'POST',
      headers: {
         'cache-control': 'no-cache',
         'content-type': 'application/json',
         'authorization': `Basic ${token}`
      },
      json: true,
      url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
      qs: {
         'api-version': util.SERVICE_ENDPOINTS_API_VERSION
      },
      body: {
         authorization: {
            parameters: {
               serviceprincipalid: (sub.servicePrincipalId && creationMode === `Manual`) ? sub.servicePrincipalId : ``,
               serviceprincipalkey: (sub.servicePrincipalKey && creationMode === `Manual`) ? sub.servicePrincipalKey : ``,
               tenantid: sub.tenantId
            },
            scheme: 'ServicePrincipal'
         },
         data: {
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            creationMode: creationMode
         },
         name: sub.name,
         type: 'azurerm',
         url: 'https://management.azure.com/'
      }
   });

   request(options, function (err, response, obj) {
      if (err) {
         callback(err);
         return;
      }

      if (creationMode === `Automatic`) {
         // Service endpoints are not created instantly in VSTS
         // using the automatic creation mode 
         // we need to wait for the status to be Failed or
         // Ready before proceeding.
         var url = `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints/${obj.id}?api-version=${util.SERVICE_ENDPOINTS_API_VERSION}`;

         var status = '';

         async.whilst(
            function () { return status !== 'Failed' && status !== 'Ready'; },
            function (finished) {
               util.checkStatus(url, token, gen, function (err, ep) {

                  if (!err) {
                     // When there is an error ep may be undefined and 
                     // this line would throw
                     status = ep.operationStatus.state;
                  }

                  finished(err, ep);
               });
            },
            function (err, body) {

               if (!err && body.operationStatus.state === 'Failed') {
                  err = { message: `Failed to create Azure Service Endpoint. ${body.operationStatus.statusMessage}` };
                  gen.log.error(`Failed to create Azure Service Endpoint. ${body.operationStatus.statusMessage}`);
               }

               callback(err, body);
            }
         );
      } else {
         callback(err, obj);
      }
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.

   run: run,
   findOrCreateAzureServiceEndpoint: findOrCreateAzureServiceEndpoint,
   createAzureServiceEndpoint: createAzureServiceEndpoint
};