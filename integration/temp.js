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


vsts.setApproval(`demonstrations`,
                  `7698a8a9-e21e-4c90-b1f0-cdf292f3dc88`, 
                  `wkz4tdzpl37mu2pkysxfotpqb6lolly3w66klyjmwakdqupbh4za`,
                  `4`,
                  `yo team`, (e, a) => {
   console.log(a);
});