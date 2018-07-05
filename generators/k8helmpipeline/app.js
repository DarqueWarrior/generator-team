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

   return new Promise(function (resolve, reject) {
      util.findAzureSub(tfs, azureSub, token, gen, function (err, sub) {
         if (sub === undefined) {
            err = { message: `${sub.displayName} Azure subscription not found. Configure Service Endpoint manually.` };
            reject(err);
         } 
         else {
            gen.log(`+ Found ${sub.displayName} Azure subscription`);
            let azureSub = {
               "name": sub.displayName,
               "id": sub.subscriptionId,
               "tenantId": sub.subscriptionTenantId
            };

            azApp.createAzureServiceEndpoint(tfs, applicationName, azureSub, token, gen, function(error, body) {
               let endpointId;
               if (error){
                  let err = error + ". Configure Service Endpoint Manually.";
                  reject(err);
               }
               if (body){
                  endpointId = body.id;
               }

               let result = {
                  "sub": azureSub,
                  "endpointId": endpointId
               };
               resolve(result);
            });
         }
      });
   });

}


function getKubeInfo(appName, tfs, pat, endpointId, kubeEndpoint, gen, callback) {
   let token = util.encodePat(pat);

   let body = {
      dataSourceDetails: {
        dataSourceUrl: "{{endpoint.url}}/subscriptions/{{endpoint.subscriptionId}}/providers/Microsoft.ContainerService/managedClusters?api-version=2017-08-31",
        parameters: {
           azureSubscriptionEndpoint: kubeEndpoint
        },
        resultSelector: "jsonpath:$.value[*]"
      },
      resultTransformationDetails: {
         resultTemplate: ""
      }
    };

    let options = {
      "method": `POST`,
      "headers": {
         "Authorization": `Basic ${token}`,
         "Content-Type": "application/json"
      },
      "json": true,
      "body": body,
      "url": `https://${tfs}.visualstudio.com/${appName}/_apis/serviceendpoint/endpointproxy?endpointId=${endpointId}&api-version=5.0-preview.1`,
   };

   let resourceGroup;
   let kubeName;
   let error;
   let kubeInfo = {};

   getKubeResourceGroup(options, function(err, group){
      if (err) {
         error = err;
      }
      else {
         kubeInfo['resourceGroup'] = group;
      }
   });

   getKubeName(options, function(err, name){
      if (err) {
         error = err;
      }
      else {
         kubeInfo['name'] = name;
      }

      callback(error, gen, kubeInfo);

   });
}

function getKubeResourceGroup(options, callback) {
   options['body']['resultTransformationDetails']['resultTemplate'] = "{{ #extractResource id resourcegroups }}";

   request(options, function(error, response, bod) {
      if (error){
         callback(error, undefined);
      }

      let result = bod['result'][0];
      callback(undefined, result);
   });
}

function getKubeName(options, callback) {
   options['body']['resultTransformationDetails']['resultTemplate'] = "{{{name}}}";

   request(options, function(error, response, bod) {
      if (error){
         callback(error, undefined);
      }

      let result = bod['result'][0];
      callback(undefined, result);
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.
   acsExtensionsCheck: acsExtensionsCheck,
   acsExtensionsCheckOrInstall: acsExtensionsCheckOrInstall,
   acsExtensionsInstall: acsExtensionsInstall,
   createArm: createArm, 
   getKubeInfo: getKubeInfo
};
