const fs = require('fs');
const env = require('node-env-file');

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
var fileName = process.env.SERVER_TO_TEST || ``
env(__dirname +  `/${fileName}.env`, {
   raise: false,
   overwrite: true
});

var logging = process.env.LOG || `off`;

function isVSTS(instance) {
   return instance.toLowerCase().match(/http/) === null;
}

var logMessage = function (msg) {
   if (logging === `on`) {
      console.log(msg);
   }
};

var logJSON = function (msg) {
   if (logging === `on`) {
      console.log(JSON.stringify(JSON.parse(msg), null, 2));
   }
};

var logReleaseResponse = function (msg) {
   if (logging === `on`) {
      let rel = JSON.parse(msg);

      console.log(`status: ${rel.value[0].status}`);

      for (let i = 0, len = rel.value[0].environments.length; i < len; i++) {
         let e = rel.value[0].environments[i];
         console.log(`${e.name}: ${e.status}`);
      }
   }
};

var logBuildResponse = function (msg) {
   if (logging === `on`) {
      let rel = JSON.parse(msg);

      console.log(`status: ${rel.value[0].status}`);
      console.log(`result: ${rel.value[0].result}`);
      console.log(`queueTime: ${rel.value[0].queueTime}`);
      console.log(`startTime: ${rel.value[0].startTime}`);
      console.log(`finishTime: ${rel.value[0].finishTime}`);
   }
};

var deleteFolderRecursive = function (path) {
   if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
         var curPath = path + "/" + file;

         if (fs.lstatSync(curPath).isDirectory()) { // recursive
            deleteFolderRecursive(curPath);
         } else { // delete file
            fs.unlinkSync(curPath);
         }
      });

      fs.rmdirSync(path);
   }
};

module.exports = {

   // Exports the portions of the file we want to share with files that require
   // it.

   rmdir: deleteFolderRecursive,
   log: logMessage,
   logJSON: logJSON,
   logBuildResponse: logBuildResponse,
   logReleaseResponse: logReleaseResponse,
   isVSTS: isVSTS
};