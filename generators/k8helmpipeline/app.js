const fs = require('fs');
const os = require('os');
const url = require('url');
const request = require(`request`);
const package = require('../../package.json');
const util = require(`../app/utility`);

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

module.exports = {

   // Exports the portions of the file we want to share with files that require 
   // it.
   acsExtensionsCheck: acsExtensionsCheck,
   acsExtensionsCheckOrInstall: acsExtensionsCheckOrInstall,
   acsExtensionsInstall: acsExtensionsInstall
};