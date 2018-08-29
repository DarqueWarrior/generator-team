// const fs = require('fs');
// const os = require('os');
// const url = require('url');
// const request = require(`request`);
// const package = require('../../package.json');
// const util = require(`../app/utility`);
// const azApp = require(`../azure/app`);
// const async = require(`async`);
// const yaml = require('yamljs');
// const utility = require(`util`);


// function run(args, gen, callback) {
//    let token = util.encodePat(args.pat);
//    let promises = [
//       createArm(args.tfs, args.azureSub, token, gen, args.appName)
//    ];

//    if (util.isACS(args.target)) {
//          acsExtensionsCheckOrInstall(args.tfs, token);
//          promises.push(createKubeEndpoint(token, args.tfs, args.appName, args.kubeName, args.kubeConfig, gen)); 
//    }
   
//    // Call the callback when both service endpoints have been created successfully 
//       Promise.all(promises)
//       .then(
//          function(data) {
//             let armResult = data[0];
//             let sub = armResult.sub;
//             let endpointId = armResult.endpointId;

//             gen.azureSub = sub.name;
//             gen.azureSubId = sub.id;
//             gen.tenantId = sub.tenantId;
//             gen.serviceEndpointId = endpointId;

//             // Kubernetes Service Endpoint only created when deploying to ACS
//             if (util.isACS(args.target)) {
//                gen.kubeEndpoint = data[1];
//             }

//             callback(undefined, gen);
//          },
//          function(err) {
//             callback(err, undefined);
//          })
//          .catch(
//             function(error) {
//                callback(error, undefined);
//          });
// }

// function acsExtensionsCheckOrInstall(accountName, token) {
//    let author = 'tsuyoshiushio';
//    let extension = 'k8s-endpoint';

//    let options = util.addUserAgent({
//    "method": `GET`,
//    "headers": {
//       "Cache-control": `no-cache`,
//       "Authorization": `Basic ${token}`
//    },
//    "url": `https://${accountName}.extmgmt.visualstudio.com/_apis/extensionmanagement/installedextensionsbyname/${author}/${extension}?api-version=${util.KUBE_API_VERSION}`,
//    });

//    acsExtensionsCheck(options, acsExtensionsInstall);
// }

// function acsExtensionsCheck(options, callback) {

//    request(options, function (error, response, body) {
//       // Need downloader, helm task
//          if (error) {
//             return console.log(error);
//          }

//          let obj = JSON.parse(body);

//          if (obj.extensionId !== 'k8s-endpoint') {
//             callback(options);
//             }

//       });
//    console.log("The extensions are installed!");
// }

// function acsExtensionsInstall(options) {
//    options.method = 'POST';

//    request(options, function (error, response, body) {
//       // Need downloader, helm task
//          if (error) {
//             return console.log(error);
//          }

//          let obj = JSON.parse(body);

//          console.log("Installing extensions...");

//       });
// }

// function createArm(tfs, azureSub, token, gen, applicationName, callback) {

//    return new Promise(function (resolve, reject) {
//       util.findAzureSub(tfs, azureSub, token, gen, function (err, sub) {
//          if (sub === undefined || err) {
//             let error = err + ". Azure subscription not found. Configure Service Endpoint manually.";
//             reject(error);
//          } 
//          else {
//             gen.log(`+ Found ${sub.displayName} Azure subscription`);
//             let azureSub = {
//                "name": sub.displayName,
//                "id": sub.subscriptionId,
//                "tenantId": sub.subscriptionTenantId
//             };

//             azApp.createAzureServiceEndpoint(tfs, applicationName, azureSub, token, gen, function(err, body) {
//                let endpointId;
//                if (err){
//                   let error = err + ". Azure Service Endpoint could not be created. Configure Service Endpoint Manually.";
//                   reject(error);
//                }
//                if (body) {
//                   endpointId = body.id;
//                }

//                let result = {
//                   "sub": azureSub,
//                   "endpointId": endpointId
//                };
//                resolve(result);
//             });
//          }
//       });
//    });

// }

// function parseKubeConfig(kubeName, fileLocation, gen, callback) {
//    // Load yaml file using yaml.load
//    try {
//          let data = yaml.load(`${fileLocation}/config`);
//          gen.log("+ Successfully loaded Kube config file");
         
//          let server;
//          for (let i = 0; i < data.clusters.length; i++) {
//             if (data.clusters[i].name === kubeName) { 
//                server = data.clusters[3].cluster.server;
//             }
//          }
         
//          let user;
//          for (let i = 0; i < data.contexts.length; i++) {
//             if (data.contexts[i].name === kubeName) { 
//                user = data.contexts[i].context.user;
//             }
//          }
         
//          let clientCertificateData;
//          let clientKeyData;
//          for (let i = 0; i < data.users.length; i++) {
//             if (data.users[i].name === user) { 
//                clientCertificateData = data.users[i].user["client-certificate-data"];
//                clientKeyData = data.users[i].user["client-key-data"];
//             }
//          }
         
//          callback(undefined, data, server, clientCertificateData, clientKeyData);
//    }
//    catch (e) {
//       gen.log("x Could not parse Kube config file");
//       callback(e);
//    }
// }

// function createKubeEndpoint(token, account, projectId, kubeName, fileLocation, gen) {
   
//    return new Promise(function(resolve, reject) {
//       parseKubeConfig(kubeName, fileLocation, gen, function(e, content, server, clientCertificateData, clientKeyData) {
//          if (e) {
//             reject(e);
//          }
//          gen.log("+ Creating Kubernetes Service Endpoint");
         
//          var options = util.addUserAgent({
//                method: 'POST',
//                headers: { 'cache-control': 'no-cache', 'content-type': 'application/json', 'authorization': `Basic ${token}` },
//                json: true,
//                url: `${util.getFullURL(account)}/${projectId}/_apis/distributedtask/serviceendpoints`,
//                qs: { 'api-version': util.SERVICE_ENDPOINTS_API_VERSION },
//                body: {
//                   authorization:
//                      {
//                         parameters: {
//                            "kubeconfig": `${content}`, 
//                            "generatePfx": "true",
//                            "ClientCertificateData": clientCertificateData,
//                            "ClientKeyData": clientKeyData
//                         },
//                         scheme: 'None'
//                      },
//                   data: {
//                      authorizationType: "Kubeconfig",
//                      acceptUntrustedCerts: "true"
//                   },
//                   name: 'Kubernetes',
//                   type: 'kubernetes',
//                   url: server
//                }
//          });

//          let kubeEndpoint;
//          request(options, function (error, response, body) {
//             if (error) {
//                gen.log("x Could not create Kubernetes Service Endpoint");
//                reject(error);
//             }

//             kubeEndpoint = body.id;
//             resolve(kubeEndpoint);
//          });
//       });
//    });
// }

// module.exports = {

//    // Exports the portions of the file we want to share with files that require 
//    // it.
//    run: run,
//    createArm: createArm,
//    createKubeEndpoint: createKubeEndpoint,
//    acsExtensionsCheck: acsExtensionsCheck,
//    acsExtensionsInstall: acsExtensionsInstall,
//    acsExtensionsCheckOrInstall: acsExtensionsCheckOrInstall
// };