const fs = require('fs');
const os = require('os');
const url = require('url');
const request = require(`request`);
const package = require('../../package.json');
const util = require(`../app/utility`);
const azApp = require(`../azure/app`);
const utility = require(`util`);

function acsExtensionsCheckOrInstall(accountName, pat) {
   let token = util.encodePat(pat);
   let author = 'tsuyoshiushio';
   let extension = 'k8s-endpoint'

   let options = {
   "method": `GET`,
   "headers": {
      "Cache-control": `no-cache`,
      "Authorization": `Basic ${token}`
   },
   "url": `https://${accountName}.extmgmt.visualstudio.com/_apis/extensionmanagement/installedextensionsbyname/${author}/${extension}?api-version=4.1-preview.1`,
   };

   acsExtensionsCheck(options,acsExtensionsInstall);
}

function acsExtensionsCheck(options,callback) {

   request(options, function (error, response, body) {
      // Need downloader, helm task
         if(error) {
            return console.log(error);
         }

         let obj = JSON.parse(body);

         if (obj['extensionId'] !== 'k8s-endpoint'){
            callback(options);
            }

      });
   console.log("The extensions are installed!");
}

function acsExtensionsInstall(options) {
   options["method"] = `POST`;

   request(options, function (error, response, body) {
      // Need downloader, helm task
         if(error) {
            return console.log(error);
         }

         let obj = JSON.parse(body);

         console.log("Installing extensions...");

      });
}

function createArm(tfs, azureSub, pat, gen, applicationName, callback){

   let token = util.encodePat(pat);

   util.findAzureSub(tfs, azureSub, token, gen, function (err, sub) {
      if (sub === undefined) {
         err = { message: `${sub.displayName} Azure subscription not found. Configure Service Endpoint manually.` };
         callback(err, sub, gen, endpointId);
      } else {
         gen.log(`+ Found ${sub.displayName} Azure subscription`);
         let azureSub = {
            "name": sub.displayName,
            "id": sub.subscriptionId,
            "tenantId": sub.subscriptionTenantId
         };

         azApp.createAzureServiceEndpoint(tfs, applicationName, azureSub, token, gen, function(error, body){
            let endpointId;
            if (error){
               let err = error + ". Configure Service Endpoint Manually.";
               callback(err, sub, gen, endpointId);
            }
            if (body){
               endpointId = body.id;
            }
            callback(error, azureSub, gen, endpointId);
         });
      }
   });

}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.
   acsExtensionsCheck: acsExtensionsCheck,
   acsExtensionsCheckOrInstall: acsExtensionsCheckOrInstall,
   acsExtensionsInstall: acsExtensionsInstall,
   createArm: createArm
};