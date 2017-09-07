const vsts = require(`./test/index`);
const azure = require(`./test/azure`);
const env = require('node-env-file');
const msRestAzure = require('ms-rest-azure');
const ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/test/.env', {
   raise: false,
   overwrite: true
});

azure.connectToAzure(() => {
   azure.getWebsiteURL(`aspFullTestdf1555bfDev`, (e, a) => {
      console.log(a);
   });
});