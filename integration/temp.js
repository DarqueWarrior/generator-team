const vsts = require(`./test/index`);
const env = require('node-env-file');
const msRestAzure = require('ms-rest-azure');
const ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/test/.env', {
   raise: false,
   overwrite: true
});

_validateEnvironmentVariables();

var clientId = process.env['SERVICE_PRINCIPALID'];
var domain = process.env['AZURE_TENANTID'];
var secret = process.env['SERVICE_PRINCIPALKEY'];
var subscriptionId = process.env['AZURE_SUBID'];
var resourceGroupName = `nodeTest42475a2bDev`;

//Entrypoint of the cleanup script
msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
   if (err) return console.log(err);
   resourceClient = new ResourceManagementClient(credentials, subscriptionId);

   console.log('\nDeleting the resource group can take few minutes, so please be patient :).');
   deleteResourceGroup(function (err, result) {
      if (err) return console.log('Error occured in deleting the resource group: ' + resourceGroupName + '\n' + util.inspect(err, {
         depth: null
      }));
      console.log('Successfully deleted the resourcegroup: ' + resourceGroupName);
   });
});

function deleteResourceGroup(callback) {
   console.log('\nDeleting resource group: ' + resourceGroupName);
   return resourceClient.resourceGroups.deleteMethod(resourceGroupName, callback);
}

function _validateEnvironmentVariables() {
   var envs = [];
   if (!process.env['SERVICE_PRINCIPALID']) envs.push('SERVICE_PRINCIPALID');
   if (!process.env['AZURE_TENANTID']) envs.push('AZURE_TENANTID');
   if (!process.env['SERVICE_PRINCIPALKEY']) envs.push('SERVICE_PRINCIPALKEY');
   if (!process.env['AZURE_SUBID']) envs.push('AZURE_SUBID');
   if (envs.length > 0) {
      throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
   }
}