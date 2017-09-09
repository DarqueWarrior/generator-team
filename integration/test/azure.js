const async = require('async');
const env = require('node-env-file');
const msRestAzure = require('ms-rest-azure');
const ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/.env', {
   raise: false,
   overwrite: true
});

var resourceClient;
var domain = process.env.AZURE_TENANTID;
var subscriptionId = process.env.AZURE_SUBID;
var secret = process.env.SERVICE_PRINCIPALKEY;
var clientId = process.env.SERVICE_PRINCIPALID;

function connectToAzure(cb) {
   //Entry point of the cleanup script
   msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
      if (err) {
         cb(err);
      }

      resourceClient = new ResourceManagementClient(credentials, subscriptionId);

      cb(null, resourceClient);
   });
}

function deleteResourceGroup(resourceGroupName, callback) {
   return resourceClient.resourceGroups.deleteMethod(resourceGroupName, callback);
}

function getACIIP(resourceGroupName, cb) {
   async.series([
         function (callback) {
            resourceClient.resourceGroups.listResources(resourceGroupName, function (err, result, request, response) {
               if (err) {
                  return callback(err);
               }

               result.forEach(function (i) {
                  if (i.type === "Microsoft.ContainerInstance/containerGroups") {
                     containerGroup = i.name;
                  }
               });

               callback(null, containerGroup);
            });
         },
         function (callback) {
            //Task 5
            resourceClient.resources.get(resourceGroupName,
               `Microsoft.ContainerInstance`,
               ``,
               `containerGroups`,
               containerGroup,
               `2017-08-01-preview`,
               function (err, result, request, response) {
                  if (err) {
                     return callback(err);
                  }

                  callback(null, `http://${result.properties.ipAddress.ip}`);
               });
         }
      ], 
      function (e, results) {
         cb(e, results[1]);
      });
}

function getWebsiteURL(resourceGroupName, cb) {
   async.series([
         function (callback) {
            resourceClient.resourceGroups.listResources(resourceGroupName, function (err, result, request, response) {
               if (err) {
                  return callback(err);
               }

               result.forEach(function (i) {
                  if (i.type === "Microsoft.Web/sites") {
                     websiteName = i.name;
                  }
               });

               callback(null, websiteName);
            });
         },
         function (callback) {
            //Task 5
            resourceClient.resources.get(resourceGroupName,
               `Microsoft.Web`,
               ``,
               `sites`,
               websiteName,
               `2015-06-01`,
               function (err, result, request, response) {
                  if (err) {
                     return callback(err);
                  }

                  callback(null, `http://${result.properties.hostNames[0]}`);
               });
         }
      ], 
      function (e, results) {
         cb(e, results[1]);
      });
}

module.exports = {
   getACIIP: getACIIP,
   getWebsiteURL: getWebsiteURL,
   connectToAzure: connectToAzure,
   deleteResourceGroup: deleteResourceGroup
};