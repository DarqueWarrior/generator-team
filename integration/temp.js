const util = require(`../generators/app/utility`);
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

util.isTFSGreaterThan2017(`http://52.165.190.138:8080/tfs/DefaultCollection`,
   `7beze45hnmaak475dskx7w5cd5ma7goydkp22gugcsxde36irzsq`,
   (e, r) => {
      console.log(r);
   });