const path = require(`path`);
const vsts = require(`./index.js`);
const request = require('request');
const env = require('node-env-file');
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/.env', {
   raise: false,
   overwrite: true
});

describe.only(`build:index cmdLine`, () => {
   "use strict";

   var projectId;
   var expectedName;
   var buildDefinitionId;

   // Arguments
   var applicationType = `node`;
   var applicationName = `nodeTest`;
   var tfs = process.env.ACCT;
   var azureSub = process.env.AZURE_SUB || ` `;
   var azureSubId = process.env.AZURE_SUBID || ` `;
   var tenantId = process.env.AZURE_TENANTID || ` `;
   var servicePrincipalId = process.env.SERVICE_PRINCIPALID || ` `;
   var queue = `default`;
   var target = `paas`;
   var installDep = `false`;
   var groupId = ` `;
   var dockerHost = process.env.DOCKER_HOST || ` `;
   var dockerCertPath = ` `;
   var dockerRegistry = process.env.DOCKER_REGISTRY || ` `;
   var dockerRegistryId = process.env.DOCKER_REGISTRY_USERNAME || ` `;
   var dockerPorts = ` `;
   var dockerRegistryPassword = ` `;
   var servicePrincipalKey = process.env.SERVICE_PRINCIPALKEY || ` `;
   var pat = process.env.PAT || ` `;

   before(function (done) {
      // runs before all tests in this block
      vsts.findProject(tfs, applicationName, pat, `yo Team`, (e, project) => {
         assert.equal(project, undefined, `Precondition not meet: Project already exist`);
         done(e);
      });
   });

   it(`node.js everything should be created`, (done) => {
      // Arrange
      expectedName = `nodeTest-CI`;

      //let cmd = `yo team ${applicationType} ${applicationName} ${tfs} ${azureSub} '${azureSubId}' '${tenantId}' '${servicePrincipalId}' ${queue} ${target} ${installDep} '${groupId}' '${dockerHost}' '${dockerCertPath}' '${dockerRegistry}' "${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}"'${servicePrincipalKey}' ${pat}`;
      let cmd = `yo team node nodeTest2 demonstrations PM_DonovanBrown " " " " " " default paas false " " " " " " " " " " " " " " " " wkz4tdzpl37mu2pkysxfotpqb6lolly3w66klyjmwakdqupbh4za`;

      exec(cmd, (error, stdout, stderr) => {
         done(error);

         if (error) {
            console.error(`exec error: ${error}`);
            return;
         }
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
      });
   });

   afterEach(function (done) {
      // runs after each test in this block
      vsts.deleteBuildDefinition(tfs, projectId, buildDefinitionId, pat, `yo team`, e => {
         done(e);
      });
   });

   after(function (done) {
      // runs after all tests in this block
      vsts.deleteProject(tfs, projectId, pat, `yo team`, (e) => {
         done(e);
      });
   });
});