const fs = require('fs');
const os = require('os');
const url = require('url');
const request = require(`request`);
const package = require('../../package.json');
const util = require(`../app/utility`);
const azApp = require(`../azure/app`);
const async = require(`async`);
const YAML = require('yamljs');
const utility = require(`util`);


function run(args, gen, callback) {
   let token = util.encodePat(args.pat);

   if (args.target === 'acs') {
         acsExtensionsCheckOrInstall(args.tfs, args.pat);
      }
   let promises = [createKubeEndpoint(token, args.tfs, args.appName, args.kubeName, args.kubeConfig, gen), createArm(args.tfs, args.azureSub, args.pat, gen, args.appName)];
   // Call the callback when both service endpoints have been created successfully 
      Promise.all(promises)
      .then(
         function(data) {
            gen.kubeEndpoint = data[0];
            let armResult = data[1];

            let sub = armResult.sub;
            let endpointId = armResult.endpointId;

            gen.azureSub = sub.name;
            gen.azureSubId = sub.id;
            gen.tenantId = sub.tenantId;
            gen.serviceEndpointId = endpointId;

            callback(undefined, gen);
         },
         function(err) {
            callback(err, undefined);
         })
         .catch(
            function(error) {
               callback(error, undefined);
         });
}

function acsExtensionsCheckOrInstall(accountName, pat) {
   let token = util.encodePat(pat);
   let author = 'tsuyoshiushio';
   let extension = 'k8s-endpoint';

   let options = util.addUserAgent({
   "method": `GET`,
   "headers": {
      "Cache-control": `no-cache`,
      "Authorization": `Basic ${token}`
   },
   "url": `https://${accountName}.extmgmt.visualstudio.com/_apis/extensionmanagement/installedextensionsbyname/${author}/${extension}?api-version=${util.KUBE_API_VERSION}`,
   });

   acsExtensionsCheck(options, acsExtensionsInstall);
}

function acsExtensionsCheck(options,callback) {

   request(options, function (error, response, body) {
      // Need downloader, helm task
         if(error) {
            return console.log(error);
         }

         let obj = JSON.parse(body);

         if (obj.extensionId !== 'k8s-endpoint') {
            callback(options);
            }

      });
   console.log("The extensions are installed!");
}

function acsExtensionsInstall(options) {
   options.method = 'POST';

   request(options, function (error, response, body) {
      // Need downloader, helm task
         if(error) {
            return console.log(error);
         }

         let obj = JSON.parse(body);

         console.log("Installing extensions...");

      });
}

function createArm(tfs, azureSub, pat, gen, applicationName, callback) {

   let token = util.encodePat(pat);

   return new Promise(function (resolve, reject) {
      util.findAzureSub(tfs, azureSub, token, gen, function (err, sub) {
         if (sub === undefined || err) {
            let error = err + ". Azure subscription not found. Configure Service Endpoint manually.";
            reject(error);
         } 
         else {
            gen.log(`+ Found ${sub.displayName} Azure subscription`);
            let azureSub = {
               "name": sub.displayName,
               "id": sub.subscriptionId,
               "tenantId": sub.subscriptionTenantId
            };

            azApp.createAzureServiceEndpoint(tfs, applicationName, azureSub, token, gen, function(err, body) {
               let endpointId;
               if (err){
                  let error = err + ". Azure Service Endpoint could not be created. Configure Service Endpoint Manually.";
                  reject(error);
               }
               if (body) {
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
   // Uses endpoint proxy to get information on Kubernetes Cluster
   let token = util.encodePat(pat);
   
      // Call the callback when both requests have been resolved
      Promise.all([getKubeResourceGroup(kubeEndpoint, token, tfs, appName, endpointId), getKubeName(kubeEndpoint, token, tfs, appName, endpointId)])
      .then(
         function(data) {

            // Data available in order it was called
            let kubeInfo = {
               "resourceGroup": data[0],
               "name": data[1]
            };

            callback(undefined, kubeInfo);
         },
         function(err) {
            gen.log("Could not retrieve Kubernetes information.");
            callback(err, undefined);
         })
         .catch(
            function(err) {
               console.log(err);
         });
}

function getKubeResourceGroup(kubeEndpoint, token, tfs, appName, endpointId) {

   return new Promise(function(resolve, reject) {
      let body = {
        "dataSourceDetails": {
        "dataSourceUrl": "{{endpoint.url}}/subscriptions/{{endpoint.subscriptionId}}/providers/Microsoft.ContainerService/managedClusters?api-version=2017-08-31",
        "parameters": {
           "azureSubscriptionEndpoint": kubeEndpoint
        },
        "resultSelector": "jsonpath:$.value[*]"
      },
      "resultTransformationDetails": {
         "resultTemplate": "{{ #extractResource id resourcegroups }}"
      }
    };

      let options = util.addUserAgent({
      "method": `POST`,
      "headers": {
         "Authorization": `Basic ${token}`,
         "Content-Type": "application/json"
      },
      "json": true,
      "body": body,
      "url": `${util.getFullURL(tfs)}/${appName}/_apis/serviceendpoint/endpointproxy?endpointId=${endpointId}&api-version=${util.KUBE_API_VERSION}`,
   });

      kubeInfoRequest(options, function(err, result) {
         if (err) {
            reject(err);
         }
         resolve(result);
      });
   });
}

function getKubeName(kubeEndpoint, token, tfs, appName, endpointId) {

   return new Promise(function(resolve, reject) {
      let body = {
        "dataSourceDetails": {
        "dataSourceUrl": "{{endpoint.url}}/subscriptions/{{endpoint.subscriptionId}}/providers/Microsoft.ContainerService/managedClusters?api-version=2017-08-31",
        "parameters": {
           "azureSubscriptionEndpoint": kubeEndpoint
        },
        "resultSelector": "jsonpath:$.value[*]"
      },
      "resultTransformationDetails": {
         "resultTemplate": "{{{name}}}"
      }
    };

      let options = util.addUserAgent({
      "method": `POST`,
      "headers": {
         "Authorization": `Basic ${token}`,
         "Content-Type": "application/json"
      },
      "json": true,
      "body": body,
      "url": `${util.getFullURL(tfs)}/${appName}/_apis/serviceendpoint/endpointproxy?endpointId=${endpointId}&api-version=${util.KUBE_API_VERSION}`,
   });
      kubeInfoRequest(options, function(err, result) {
         if (err){
            reject(err);
         }
         resolve(result);
      });
   });
}

function kubeInfoRequest(options, callback) {
   let statusCode;
   let errorCode = false;

   // Work around of "BadRequest" error, will work if called again
   async.whilst(
      function () { return statusCode !== 'ok' && !errorCode; },
      function (finished) {
         request(options, function(error, response, bod) {

            if (error) {
               errorCode = true;
            }
            else if ('errorCode' in bod) {
               errorCode = true;
               error = bod.message;
            }
            else {
               statusCode = bod.statusCode;
            }

            finished(error, bod);
         }
      )},
      function (err, body) {
         if (err) {
            callback(err, undefined);
         }

         let result = body.result[0];
         callback(err, result);
      }
   );
}

function parseKubeConfig(kubeName, fileLocation, gen, callback) {
   // Load yaml file using YAML.load
   try {
         let data = YAML.load(`${fileLocation}/config`);
         gen.log("+ Successfully loaded Kube config file");
         
         let server;
         for (let i = 0; i < data.clusters.length; i++) {
            if (data.clusters[i].name === kubeName) { 
               server = data.clusters[3].cluster.server;
            }
         }
         
         let user;
         for (let i = 0; i < data.contexts.length; i++) {
            if (data.contexts[i].name === kubeName) { 
               user = data.contexts[i].context.user;
            }
         }
         
         let clientCertificateData;
         let clientKeyData;
         for (let i = 0; i < data.users.length; i++) {
            if (data.users[i].name === user) { 
               clientCertificateData = data.users[i].user["client-certificate-data"];
               clientKeyData = data.users[i].user["client-key-data"];
            }
         }
         
         callback(undefined, data, server, clientCertificateData, clientKeyData);
   }
   catch (e) {
      gen.log("x Could not parse Kube config file");
      callback(e);
   }
}

function createKubeEndpoint(token, account, projectId, kubeName, fileLocation, gen) {
   
   return new Promise(function(resolve, reject) {
      parseKubeConfig(kubeName, fileLocation, gen, function(e, content, server, clientCertificateData, clientKeyData) {
         if (e) {
            reject(e);
         }
         gen.log("+ Creating Kubernetes Service Endpoint");
         
         var options = util.addUserAgent({
               method: 'POST',
               headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
               json: true,
               url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
               qs: { 'api-version': util.SERVICE_ENDPOINTS_API_VERSION },
               body: {
                  authorization:
                     {
                        parameters: {
                           "kubeconfig": `${content}`, //Don't think I need content
                           "generatePfx": "true",
                           "ClientCertificateData": clientCertificateData,
                           "ClientKeyData": clientKeyData
                        },
                        scheme: 'None'
                     },
                  data: {
                     authorizationType: "Kubeconfig",
                     acceptUntrustedCerts: "true"
                  },
                  name: 'Kubernetes',
                  type: 'kubernetes',
                  url: server
               }
         });

         let kubeEndpoint;
         request(options, function (error, response, body) {
            if (error) {
               gen.log("x Could not create Kubernetes Service Endpoint");
               reject(error);
            }

            kubeEndpoint = body.id;
            resolve(kubeEndpoint);
         });
      });
   });
}

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.
   run: run,
   createArm: createArm, 
   getKubeInfo: getKubeInfo,
   createKubeEndpoint: createKubeEndpoint,
   acsExtensionsCheck: acsExtensionsCheck,
   acsExtensionsInstall: acsExtensionsInstall,
   acsExtensionsCheckOrInstall: acsExtensionsCheckOrInstall
};