const fs = require('fs');
const async = require('async');
const util = require(`./util`);
const vsts = require(`./index`);
const azure = require(`./azure`);
const uuidV4 = require('uuid/v4');
const request = require('request');
const env = require('node-env-file');
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;

const userAgent = `yo team`;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname + '/.env', {
   raise: false,
   overwrite: true
});

describe.only(`Azure Container Instances (Linux)`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeACITest`,
      target: `acilinux`,
   }, {
      appType: `asp`,
      appName: `aspACITest`,
      target: `acilinux`,
   }, {
      appType: `java`,
      appName: `javaACITest`,
      target: `acilinux`,
      groupId: `unitTest`
   }];

   iterations.forEach(Tests);
});

describe(`Docker Host`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeDockerTest`,
      target: `docker`,
   }, {
      appType: `asp`,
      appName: `aspDockerTest`,
      target: `docker`,
   }, {
      appType: `java`,
      appName: `javaDockerTest`,
      target: `docker`,
      groupId: `unitTest`
   }];

   iterations.forEach(Tests);
});

function Tests(iteration) {
   var projectId;
   var approvalId;
   var originalDir = process.cwd();

   // RM has issues if you try to create a release on
   // a project name that was just deleted and recreated
   //So we gen a GUID and a portion to the applicationName
   // to help with that.
   let uuid = uuidV4();

   // Arguments
   var applicationType = iteration.appType;
   var applicationName = iteration.appName + uuid.substring(0, 8);
   var tfs = process.env.ACCT;
   var azureSub = process.env.AZURE_SUB || ` `;
   var azureSubId = process.env.AZURE_SUBID || ` `;
   var tenantId = process.env.AZURE_TENANTID || ` `;
   var servicePrincipalId = process.env.SERVICE_PRINCIPALID || ` `;
   var queue = `default`;
   var target = iteration.target;
   var installDep = `false`;
   var groupId = iteration.appName || ` `;
   var dockerHost = process.env.DOCKER_HOST || ` `;
   var dockerCertPath = process.env.DOCKER_CERT_PATH || ` `;
   var dockerRegistry = process.env.DOCKER_REGISTRY || ` `;
   var dockerRegistryId = process.env.DOCKER_REGISTRY_USERNAME || ` `;
   var dockerPorts = process.env.DOCKER_PORTS || ` `;
   var dockerRegistryPassword = process.env.DOCKER_REGISTRY_PASSWORD || ` `;
   var servicePrincipalKey = process.env.SERVICE_PRINCIPALKEY || ` `;
   var pat = process.env.PAT || ` `;
   var doNotCleanUp = process.env.DO_NOT_CLEAN_UP;

   context(`Running Yo Team ${iteration.appType}`, function () {

      before(function (done) {
         // runs before all tests in this block
         // Run the command. The parts will be verified below.
         let cmd = `yo team node ${applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
            `"${tenantId}" "${servicePrincipalId}" ${queue} ${target} ${installDep} ` +
            `"${groupId}" "${dockerHost}" "${dockerCertPath}" "${dockerRegistry}" ` +
            `"${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}" "${servicePrincipalKey}" ${pat}`;

         util.log(`run command: ${cmd}`);

         // Act
         exec(cmd, (error, stdout, stderr) => {
            util.log(`stdout: ${stdout}`);
            util.log(`stderr: ${stderr}`);

            if (error) {
               // This may happen if yo team is not installed
               console.error(`exec error: ${error}`);
               done(error);
               return;
            }

            done(error);
         });
      });

      context(`Verify everything was created`, function () {
         it(`${applicationName} project should be created`, function (done) {
            // Arrange
            let expectedName = `${applicationName}`;

            util.log(`Find project ${expectedName}`);

            vsts.findProject(tfs, expectedName, pat, userAgent, (e, p) => {
               // Assert
               assert.ifError(e);
               assert.ok(p, `project not found`);

               projectId = p.id;

               done(e);
            });
         });

         it(`${applicationName}-Docker-CI build definition should be created`, function (done) {
            // Arrange
            let expectedName = `${applicationName}-Docker-CI`;

            util.log(`Find build ${expectedName}`);

            vsts.findBuildDefinition(tfs, projectId, pat, expectedName, userAgent, (e, b) => {
               // Assert
               assert.ifError(e);
               assert.ok(b, `build defintion not found`);

               done(e);
            });
         });

         it(`${applicationName}-Docker-CD release definition should be created`, function (done) {
            // Arrange
            let expectedName = `${applicationName}-Docker-CD`;

            util.log(`Find release ${expectedName}`);

            vsts.findReleaseDefinition(tfs, projectId, pat, expectedName, userAgent, (e, r) => {
               // Assert
               assert.ifError(e);
               assert.ok(r, `release defintion not found`);

               done(e);
            });
         });

         // When using your own docker host azure service
         // is not needed.
         if (iteration.target !== `docker`) {
            it(`${azureSub} azure service endpoint should be created`, function (done) {
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
         }

         it(`files should be created`, function () {
            assert.ok(fs.existsSync(applicationName));
         });

         it(`git push should succeed`, function (done) {
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
      });

      context(`Build is running ${iteration.appType}`, function () {
         it(`build should succeed`, function (done) {
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
      });

      context(`Release is running ${iteration.appType}`, function () {
         it(`release should succeed in dev`, function (done) {
            let id = 0;
            let status = ``;

            // Wait for release to succeed or fail
            async.whilst(
               () => {
                  return status !== `rejected` && status !== `succeeded` && status !== `partiallySucceeded`;
               },
               (finished) => {
                  vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                     if (r.length > 0) {
                        status = r[0].environments[0].status;
                     }
                     finished(err);
                  });
               },
               (e) => {
                  // Get the release log            
                  assert.ok(status === `succeeded` || status === `partiallySucceeded`);
                  done(e);
               }
            );
         });

         if (iteration.target !== `docker`) {
            it(`dev site should be accessible`, function (done) {
               azure.connectToAzure(function () {
                  azure.getACIIP(`${applicationName}Dev`, function (e, url) {
                     assert.ifError(e);
                     util.log(`trying to access ${url}`);
                     request({
                        url: url
                     }, function (err, res, body) {
                        assert.ifError(err);
                        done();
                     });
                  });
               });
            });
         }
      });

      // runs after all tests in this block
      after(function (done) {
         if (doNotCleanUp === `true`) {
            done();
            return;
         }

         // Delete files, project, and resource group.
         async.parallel([
            (inParallel) => {
               util.log(`delete project: ${projectId}`);
               vsts.deleteProject(tfs, projectId, pat, userAgent, inParallel);
            },
            (inParallel) => {
               util.log(`cd to: ${originalDir}`);
               process.chdir(originalDir);

               util.log(`delete folder: ${applicationName}`);
               util.rmdir(applicationName);

               inParallel();
            },
            (inParallel) => {
               if (iteration.target !== `docker`) {
                  azure.connectToAzure(function () {
                     util.log(`delete resource group: ${applicationName}Dev`);
                     azure.deleteResourceGroup(`${applicationName}Dev`, inParallel);
                  });
               } else {
                  inParallel();
               }
            }
         ], done);
      });
   });
}