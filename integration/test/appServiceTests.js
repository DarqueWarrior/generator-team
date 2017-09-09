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

describe(`Azure App Service (Windows)`, function () {
   "use strict";
   var iterations = [{
         appType: `aspFull`,
         appName: `aspFullTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         suffix: ``,
         queue: `default`
      },
      {
         appType: `node`,
         appName: `nodePaaSTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         suffix: ``,
         queue: `default`
      }, {
         appType: `asp`,
         appName: `aspPaaSTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         suffix: ``,
         queue: `default`
      }, {
         appType: `asp`,
         appName: `aspDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         suffix: `-Docker`,
         queue: `default`
      }, {
         appType: `java`,
         appName: `javaPaaSTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         groupId: `unitTest`,
         suffix: ``,
         queue: `default`
      }
   ];

   iterations.forEach(Tests);
});

describe(`Azure App Service Docker (Linux)`, function () {
   "use strict";
   var iterations = [{
         appType: `node`,
         appName: `nodeDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         suffix: `-Docker`,
         queue: `default`
      }, {
         appType: `asp`,
         appName: `aspDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         suffix: `-Docker`,
         queue: `default`
      }, {
         appType: `java`,
         appName: `javaDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         groupId: `unitTest`,
         suffix: `-Docker`,
         queue: `default`
      }
   ];

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
   var queue = iteration.queue;
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

   context(`${iteration.appType} - ${iteration.context}`, function () {

      before(function (done) {
         // runs before all tests in this block
         // Run the command. The parts will be verified below.
         let cmd = `yo team ${applicationType} ${applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
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

      it(`${applicationName}${iteration.suffix}-CI build definition should be created`, function (done) {
         // Arrange
         let expectedName = `${applicationName}${iteration.suffix}-CI`;

         util.log(`Find build ${expectedName}`);

         vsts.findBuildDefinition(tfs, projectId, pat, expectedName, userAgent, (e, b) => {
            // Assert
            assert.ifError(e);
            assert.ok(b, `build defintion not found`);

            done(e);
         });
      });

      it(`${applicationName}${iteration.suffix}-CD release definition should be created`, function (done) {
         // Arrange
         let expectedName = `${applicationName}${iteration.suffix}-CD`;

         util.log(`Find release ${expectedName}`);

         vsts.findReleaseDefinition(tfs, projectId, pat, expectedName, userAgent, (e, r) => {
            // Assert
            assert.ifError(e);
            assert.ok(r, `release defintion not found`);

            done(e);
         });
      });

      it(`${azureSub} azure service endpoint should be created`, function (done) {
         if (iteration.target === `docker`) {
            // When using your own docker host azure service
            // is not needed.
            this.skip();
         }

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

      it(`dev site should be accessible`, function (done) {
         azure.connectToAzure(function () {
            azure.getWebsiteURL(`${applicationName}Dev`, function (e, url) {
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

      it(`approval is waiting to qa`, function (done) {
         util.log(`Find approval`);

         vsts.getApprovals(tfs, projectId, pat, userAgent, (e, a) => {
            // Assert
            assert.ifError(e);
            assert.ok(a, `approval not found`);

            approvalId = a.value[0].id;

            done(e);
         });
      });

      it(`release should succeed in qa`, function (done) {
         let id = 0;
         let status = ``;

         assert.ok(approvalId);

         vsts.setApproval(tfs, projectId, pat, approvalId, userAgent, (e) => {
            approvalId = undefined;
            assert.ifError(e);

            // Wait for release to succeed or fail
            async.whilst(
               () => {
                  return status !== `rejected` && status !== `succeeded`;
               },
               (finished) => {
                  vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                     if (r.length > 0) {
                        status = r[0].environments[1].status;
                     }
                     finished(err);
                  });
               },
               (e) => {
                  // Get the release log            
                  assert.equal(status, `succeeded`);
                  done(e);
               }
            );
         });
      });

      it(`qa site should be accessible`, function (done) {
         azure.getWebsiteURL(`${applicationName}QA`, function (e, url) {
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

      it(`approval is waiting to prod`, function (done) {
         util.log(`Find approval`);

         vsts.getApprovals(tfs, projectId, pat, userAgent, (e, a) => {
            // Assert
            assert.ifError(e);
            assert.ok(a, `approval not found`);

            approvalId = a.value[0].id;

            done(e);
         });
      });

      it(`release should succeed in prod`, function (done) {
         let id = 0;
         let status = ``;

         assert.ok(approvalId);

         vsts.setApproval(tfs, projectId, pat, approvalId, userAgent, (e) => {
            assert.ifError(e);

            // Wait for release to succeed or fail
            async.whilst(
               () => {
                  return status !== `rejected` && status !== `succeeded`;
               },
               (finished) => {
                  vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                     if (r.length > 0) {
                        status = r[0].environments[2].status;
                     }
                     finished(err);
                  });
               },
               (e) => {
                  // Get the release log            
                  assert.equal(status, `succeeded`);
                  done(e);
               }
            );
         });
      });

      it(`prod site should be accessible`, function (done) {
         azure.getWebsiteURL(`${applicationName}Prod`, function (e, url) {
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
               util.log(`delete resource group: ${applicationName}Dev`);
               azure.deleteResourceGroup(`${applicationName}Dev`, inParallel);
            },
            (inParallel) => {
               util.log(`delete resource group: ${applicationName}QA`);
               azure.deleteResourceGroup(`${applicationName}QA`, inParallel);
            },
            (inParallel) => {
               util.log(`delete resource group: ${applicationName}Prod`);
               azure.deleteResourceGroup(`${applicationName}Prod`, inParallel);
            }
         ], done);
      });
   });
}