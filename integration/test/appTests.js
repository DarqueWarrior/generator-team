const fs = require('fs');
const path = require(`path`);
const async = require('async');
const util = require(`./util`);
const vsts = require(`./index`);
const request = require('request');
const env = require('node-env-file');
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;

const userAgent = `yo team`;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/.env', {
   raise: false,
   overwrite: true
});

describe.only(`app:index cmdLine tfs node paas`, () => {
   "use strict";

   var projectId;
   var originalDir = process.cwd();

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
   var doNotCleanUp = process.env.DO_NOT_CLEAN_UP;

   before(function (done) {
      // runs before all tests in this block
      vsts.findProject(tfs, applicationName, pat, userAgent, (e, project) => {

         if (e) {
            done(e);
         }

         if (project) {
            projectId = project.id;
            assert.equal(project, undefined, `Precondition not meet: Project already exist`);
         }

         // Run the command. The parts will be verified below.
         let cmd = `yo team node ${applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
            `"${tenantId}" "${servicePrincipalId}" ${queue} ${target} ${installDep} ` +
            `"${groupId}" "${dockerHost}" "${dockerCertPath}" "${dockerRegistry}" ` +
            `"${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}" "${servicePrincipalKey}" ${pat}`;

         util.log(`run command: ${cmd}`);

         // Act
         exec(cmd, (error, stdout, stderr) => {
            if (error) {
               // This may happen if yo team is not installed
               console.error(`exec error: ${error}`);
               done(error);
               return;
            }

            util.log(`stdout: ${stdout}`);
            util.log(`stderr: ${stderr}`);

            // Find the project id
            util.log(`find project: ${applicationName}`);

            vsts.findProject(tfs, applicationName, pat, userAgent, (e, p) => {
               if (e) {
                  done(e);
               }

               projectId = p.id;

               util.log(`project found: ${projectId}`);

               done(e);
            });
         });
      });
   });

   it(`build definition should be created`, (done) => {
      // Arrange
      let expectedName = `nodeTest-CI`;

      util.log(`Find build ${expectedName}`);

      vsts.findBuildDefinition(tfs, projectId, pat, expectedName, userAgent, (e, b) => {
         // Assert
         assert.ifError(e);
         assert.ok(b, `build defintion not found`);

         done(e);
      });
   });

   it(`release definition should be created`, (done) => {
      // Arrange
      let expectedName = `nodeTest-CD`;

      util.log(`Find release ${expectedName}`);

      vsts.findReleaseDefinition(tfs, projectId, pat, expectedName, userAgent, (e, r) => {
         // Assert
         assert.ifError(e);
         assert.ok(r, `release defintion not found`);

         done(e);
      });
   });

   it(`azure service endpoint should be created`, (done) => {
      // Arrange
      let expectedName = azureSub;

      util.log(`Find release ${expectedName}`);

      vsts.findAzureServiceEndpoint(tfs, projectId, pat, expectedName, userAgent, (e, ep) => {
         // Assert
         assert.ifError(e);
         assert.ok(ep, `service endpoint not found`);

         done(e);
      });
   });

   it(`files should be created`, () => {
      assert.ok(fs.existsSync(applicationName));
   });

   it(`git push should succeed`, (done) => {
      util.log(`cd to: ${__dirname}/../${applicationName}`);
      process.chdir(`${__dirname}/../${applicationName}`);

      util.log(`git push`);
      exec(`git push`, (error, stdout, stderr) => {
         if (error) {
            // This may happen if git errors
            console.error(`exec error: ${error}`);
            done(error);
            return;
         }

         util.log(`stdout: ${stdout}`);
         util.log(`stderr: ${stderr}`);

         done(error);
      });
   });

   it(`build should succeed`, (done) => {
      let id = 0;
      let result = ``;

      // Wait for build to succeed or fail
      async.whilst(
         () => {
            return result !== `failed` && result !== `succeeded`;
         },
         (finished) => {
            vsts.getBuilds(tfs, projectId, pat, userAgent, (err, blds) => {
               if (blds.length > 0) {
                  id = blds[0].id;
                  result = blds[0].result;
               }
               finished(err);
            });
         },
         (e) => {
            // Get the build log
            vsts.getBuildLog(tfs, projectId, pat, id, userAgent, (e, logs) => {
               assert.equal(result, `succeeded`, logs);
               done(e);
            });
         }
      );
   });

   // runs after all tests in this block
   after(function (done) {
      util.log(`delete project: ${projectId}`);

      if (doNotCleanUp) {
         done();
         return;
      }

      vsts.deleteProject(tfs, projectId, pat, userAgent, (e) => {
         util.log(`cd to: ${originalDir}`);
         process.chdir(originalDir);

         util.log(`delete folder: ${applicationName}`);
         util.rmdir(applicationName);

         done(e);
      });
   });
});