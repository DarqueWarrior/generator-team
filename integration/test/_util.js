const fs = require('fs');
const env = require('node-env-file');

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
var fileName = process.env.SERVER_TO_TEST || ``
env(__dirname + `/${fileName}.env`, {
   raise: false,
   overwrite: true
});

var logging = process.env.LOG || `off`;

String.prototype.replaceAll = function (search, replacement) {
   var target = this;
   return target.split(search).join(replacement);
};

function isVSTS(instance) {
   return instance.toLowerCase().match(/http/) === null;
}

function protectMsg(msg) {
   let secrets = [process.env.PAT,
   process.env.DOCKER_REGISTRY_PASSWORD,
   process.env.SERVICE_PRINCIPAL_KEY,
   process.env.SERVICE_PRINCIPAL_ID,
   process.env.AZURE_SUB,
   process.env.DOCKER_CERT_PATH,
   process.env.AZURE_SUB_ID,
   process.env.AZURE_SECRET,
   process.env.DOCKER_HOST,
   process.env.AZURE_TENANT_ID,
   process.env.API_KEY];

   secrets.forEach(function (secret) {
      msg = msg.replaceAll(secret, '*****');
   });

   return msg;
}

var logMessage = function (msg) {
   if (logging === `on`) {
      console.log(protectMsg(msg));
   }
};

var logJSON = function (msg) {
   if (logging === `on`) {
      logMessage(JSON.stringify(JSON.parse(msg), null, 2));
   }
};

var logReleaseResponse = function (msg) {
   if (logging === `on`) {
      let rel = JSON.parse(msg);

      logMessage(`status: ${rel.value[0].status}`);

      for (let i = 0, len = rel.value[0].environments.length; i < len; i++) {
         let e = rel.value[0].environments[i];
         logMessage(`${e.name}: ${e.status}`);
      }
   }
};

var logBuildResponse = function (msg) {
   if (logging === `on`) {
      let rel = JSON.parse(msg);

      logMessage(`status: ${rel.value[0].status}`);
      logMessage(`result: ${rel.value[0].result}`);
      logMessage(`queueTime: ${rel.value[0].queueTime}`);
      logMessage(`startTime: ${rel.value[0].startTime}`);
      logMessage(`finishTime: ${rel.value[0].finishTime}`);
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