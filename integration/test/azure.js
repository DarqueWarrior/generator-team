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

//Entrypoint of the cleanup script
msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
   if (err) return console.log(err);
   resourceClient = new ResourceManagementClient(credentials, subscriptionId);
});

function deleteResourceGroup(resourceGroupName, callback) {
   return resourceClient.resourceGroups.deleteMethod(resourceGroupName, callback);
}

module.exports = {
   deleteResourceGroup: deleteResourceGroup
};