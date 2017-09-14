const fs = require('fs');
const async = require('async');
const util = require(`./util`);
const vsts = require(`./index`);
const azure = require(`./azure`);
const uuidV4 = require('uuid/v4');
const request = require('request');
const cheerio = require('cheerio');
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

function requestSite(applicationName, env, title, cb) {
   azure.getWebsiteURL(`${applicationName}${env}`, function (e, url) {
      assert.ifError(e);
      util.log(`trying to access ${url}`);
      request({
         url: url
      }, function (err, res, body) {
         assert.ifError(err);

         var dom = cheerio.load(body);
         assert.equal(dom(`title`).text(), `${title}`);

         cb(err, res, body);
      });
   });
}

function runTests(iteration) {
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
   var azureSubId = process.env.AZURE_SUB_ID || ` `;
   var tenantId = process.env.AZURE_TENANT_ID || ` `;
   var servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID || ` `;
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
   var servicePrincipalKey = process.env.SERVICE_PRINCIPAL_KEY || ` `;
   var pat = process.env.PAT || ` `;
   var doNotCleanUp = process.env.DO_NOT_CLEAN_UP;

   // The number of levels up from the folder the test are executed in to the 
   // folder where the repository was cloned.  This is not the same when run locally
   // vs. run on a build machine. 
   var levelsUp = process.env.LEVELS_UP || `/../`;

   context(`Running Yo Team ${iteration.appType}`, function () {

      before(function (done) {
         // runs before all tests in this block
         // Run the command. The parts will be verified below.
         let cmd = `yo team ${applicationType} ${applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
            `"${tenantId}" "${servicePrincipalId}" "${queue}" ${target} ${installDep} ` +
            `"${groupId}" "${dockerHost}" "${dockerCertPath}" "${dockerRegistry}" ` +
            `"${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}" "${servicePrincipalKey}" ${pat}`;

         util.log(`run command: ${cmd}`);

         // Act
         // Execute yo team and log into azure (used during clean up).
         async.parallel([
            function (parallel) {
               exec(cmd, (error, stdout, stderr) => {
                  util.log(`stdout: ${stdout}`);
                  util.log(`stderr: ${stderr}`);

                  if (error) {
                     // This may happen if yo team is not installed
                     console.error(`exec error: ${error}`);
                     parallel(error);
                     return;
                  }

                  parallel(error);
               });
            },
            function (parallel) {
               azure.connectToAzure(parallel);
            }
         ], done);
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

         it(`${applicationName}${iteration.suffix}-CI build definition should be created`, function (done) {
            // Arrange
            let expectedName = `${applicationName}${iteration.suffix}-CI`;

            util.log(`Find build ${expectedName}`);

            vsts.findBuildDefinition(tfs, projectId, pat, expectedName, userAgent, (e, b) => {
               // Assert
               assert.ifError(e);
               assert.ok(b, `build definition not found`);

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
               assert.ok(r, `release definition not found`);

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

            util.log(`Find service endpoint ${expectedName}`);

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
      });

      context(`Push code to remote`, function () {
         it(`git push should succeed`, function (done) {
            util.log(`cd to: ${__dirname}${levelsUp}${applicationName}`);
            process.chdir(`${__dirname}${levelsUp}${applicationName}`);

            util.log(`git push`);
            exec(`git push`, (error, stdout, stderr) => {
               util.log(`cd to: ${originalDir}`);
               process.chdir(originalDir);

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
               function () {
                  return result !== `failed` && result !== `succeeded`;
               },
               function (finished) {
                  vsts.getBuilds(tfs, projectId, pat, userAgent, (err, builds) => {
                     if (builds.length > 0) {
                        id = builds[0].id;
                        result = builds[0].result;
                     }
                     finished(err);
                  });
               },
               function (e) {
                  // Get the build log
                  vsts.getBuildLog(tfs, projectId, pat, id, userAgent, (e, logs) => {
                     assert.equal(result, `succeeded`, logs);
                     done(e);
                  });
               }
            );
         });
      });

      context(`Release to Dev is running ${iteration.appType}`, function () {
         it(`release should succeed in dev`, function (done) {
            let id = 0;
            let status = ``;

            // Wait for release to succeed or fail
            async.whilst(
               function () {
                  return status !== `rejected` && status !== `succeeded` && status !== `partiallySucceeded`;
               },
               function (finished) {
                  vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                     if (r.length > 0) {
                        status = r[0].environments[0].status;
                     }
                     finished(err);
                  });
               },
               function (e) {
                  // Get the release log            
                  assert.ok(status === `succeeded` || status === `partiallySucceeded`);
                  done(e);
               }
            );
         });

         it(`dev site should be accessible`, function (done) {
            // Retry test up to 4 times
            // Some sites take a while to jit.
            this.retries(4);

            requestSite(applicationName, "Dev", iteration.title, done);
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
      });

      context(`Release to QA is running ${iteration.appType}`, function () {
         it(`release should succeed in qa`, function (done) {
            let id = 0;
            let status = ``;

            assert.ok(approvalId);

            vsts.setApproval(tfs, projectId, pat, approvalId, userAgent, function (e) {
               approvalId = undefined;
               assert.ifError(e);

               // Wait for release to succeed or fail
               async.whilst(
                  function () {
                     return status !== `rejected` && status !== `succeeded`;
                  },
                  function (finished) {
                     vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                        if (r.length > 0) {
                           status = r[0].environments[1].status;
                        }
                        finished(err);
                     });
                  },
                  function (e) {
                     // Get the release log            
                     assert.equal(status, `succeeded`);
                     done(e);
                  }
               );
            });
         });

         it(`qa site should be accessible`, function (done) {
            // Retry test up to 4 times
            // Some sites take a while to jit.
            this.retries(4);

            requestSite(applicationName, "QA", iteration.title, done);
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
      });

      context(`Release to Prod is running ${iteration.appType}`, function () {
         it(`release should succeed in prod`, function (done) {
            let id = 0;
            let status = ``;

            assert.ok(approvalId);

            vsts.setApproval(tfs, projectId, pat, approvalId, userAgent, function (e) {
               assert.ifError(e);

               // Wait for release to succeed or fail
               async.whilst(
                  function () {
                     return status !== `rejected` && status !== `succeeded`;
                  },
                  function (finished) {
                     vsts.getReleases(tfs, projectId, pat, userAgent, (err, r) => {
                        if (r.length > 0) {
                           status = r[0].environments[2].status;
                        }
                        finished(err);
                     });
                  },
                  function (e) {
                     // Get the release log            
                     assert.equal(status, `succeeded`);
                     done(e);
                  }
               );
            });
         });

         it(`prod site should be accessible`, function (done) {
            // Retry test up to 4 times
            // Some sites take a while to jit.
            this.retries(4);

            requestSite(applicationName, "Prod", iteration.title, done);
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
            function (inParallel) {
               util.log(`delete project: ${projectId}`);
               vsts.deleteProject(tfs, projectId, pat, userAgent, inParallel);
            },
            function (inParallel) {
               util.log(`delete folder: ${applicationName}`);
               util.rmdir(applicationName);

               inParallel();
            },
            function (inParallel) {
               util.log(`delete resource group: ${applicationName}Dev`);
               azure.deleteResourceGroup(`${applicationName}Dev`, inParallel);
            },
            function (inParallel) {
               util.log(`delete resource group: ${applicationName}QA`);
               azure.deleteResourceGroup(`${applicationName}QA`, inParallel);
            },
            function (inParallel) {
               util.log(`delete resource group: ${applicationName}Prod`);
               azure.deleteResourceGroup(`${applicationName}Prod`, inParallel);
            }
         ], done);
      });
   });
}

module.exports = {
   runTests: runTests
};