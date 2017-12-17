const fs = require('fs');
const async = require('async');
const util = require(`./_util`);
const vsts = require(`./_index`);
const azure = require(`./_azure`);
const uuidV4 = require('uuid/v4');
const cheerio = require('cheerio');
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

var tfs = process.env.ACCT;
var pat = process.env.PAT || ` `;
var azureSub = process.env.AZURE_SUB || ` `;
var doNotCleanUp = process.env.DO_NOT_CLEAN_UP;
var dockerHost = process.env.DOCKER_HOST || ` `;
var azureSubId = process.env.AZURE_SUB_ID || ` `;
var tenantId = process.env.AZURE_TENANT_ID || ` `;
var dockerPorts = process.env.DOCKER_PORTS || ` `;
var dockerRegistry = process.env.DOCKER_REGISTRY || ` `;
var dockerCertPath = process.env.DOCKER_CERT_PATH || ` `;
var servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID || ` `;
var servicePrincipalKey = process.env.SERVICE_PRINCIPAL_KEY || ` `;
var dockerRegistryId = process.env.DOCKER_REGISTRY_USERNAME || ` `;
var dockerRegistryPassword = process.env.DOCKER_REGISTRY_PASSWORD || ` `;

// The number of levels up from the folder the test are executed in to the 
// folder where the repo was cloned.  This is not the same when run locally
// vs. run on a build machine. 
var levelsUp = process.env.LEVELS_UP || `/../`;

function runTests(iteration) {
   "use strict";

   iteration.originalDir = process.cwd();
   var customFolder = iteration.customFolder || ` `;

   // RM has issues if you try to create a release on
   // a project name that was just deleted and recreated
   //So we gen a GUID and a portion to the applicationName
   // to help with that.
   iteration.uuid = uuidV4();

   // Arguments
   iteration.applicationName = iteration.appName + iteration.uuid.substring(0, 8);

   var installDep = `false`;
   context(`${iteration.appType}`, function () {
      this.bail(true);

      before(function (done) {
         // runs before all tests in this block
         // The Azure connection will be use to find IPs of ACI
         // and also in after to clean up.
         azure.connectToAzure(done);
      });

      context(`Execute command line`, function () {
         it(`Should complete without error`, function (done) {
            // Run the command. The parts will be verified below.
            let cmd = `yo team ${iteration.appType} ${iteration.applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
               `"${tenantId}" "${servicePrincipalId}" "${iteration.queue}" ${iteration.target} ${installDep} ` +
               `"${iteration.groupId}" "${dockerHost}" "${dockerCertPath}" "${dockerRegistry}" ` +
               `"${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}" "${servicePrincipalKey}" ${pat} "${customFolder}"`;

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
      });

      context(`Verify everything was created`, function () {
         it(`${iteration.applicationName} project should be created`, function (done) {
            // Arrange
            util.log(`Find project ${iteration.applicationName}`);

            vsts.findProject(tfs, iteration.applicationName, pat, userAgent, (e, p) => {
               // Assert
               util.log(`Error:\r\n${e}`);
               assert.ifError(e);

               util.log(`Project:\r\n${p}`);
               assert.ok(p, `project not found`);

               iteration.projectId = p.id;

               done(e);
            });
         });

         it(`${iteration.applicationName}-Docker-CI build definition should be created`, function (done) {
            // Arrange
            let expectedName = `${iteration.applicationName}-Docker-CI`;

            util.log(`Find build ${expectedName}`);

            vsts.findBuildDefinition(tfs, iteration.projectId, pat, expectedName, userAgent, (e, b) => {
               // Assert
               util.log(`Error:\r\n${e}`);
               assert.ifError(e);
               assert.ok(b, `build definition not found`);
               util.log(`+ Found build ${expectedName}`);

               done(e);
            });
         });

         it(`${iteration.applicationName}-Docker-CD release definition should be created`, function (done) {
            // Arrange
            let expectedName = `${iteration.applicationName}-Docker-CD`;

            util.log(`Find release ${expectedName}`);

            vsts.findReleaseDefinition(tfs, iteration.projectId, pat, expectedName, userAgent, (e, r) => {
               // Assert
               assert.ifError(e);
               assert.ok(r, `release definition not found`);
               util.log(`+ Found release ${expectedName}`);

               done(e);
            });
         });

         // When using your own docker host azure service
         // is not needed.
         if (iteration.target !== `docker`) {
            it(`${azureSub} azure service endpoint should be created`, function (done) {
               // Arrange
               let expectedName = azureSub;

               util.log(`Find service endpoint ${expectedName}`);

               vsts.findAzureServiceEndpoint(tfs, iteration.projectId, pat, expectedName, userAgent, (e, ep) => {
                  // Assert
                  assert.ifError(e);
                  assert.ok(ep, `service endpoint not found`);
                  util.log(`+ Found service endpoint ${expectedName}`);

                  done(e);
               });
            });
         }

         it(`files should be created`, function () {
            assert.ok(fs.existsSync(iteration.applicationName));
         });
      });

      context(`Push code to remote`, function () {
         it(`git push should succeed`, function (done) {
            util.log(`cd to: ${__dirname}${levelsUp}${iteration.applicationName}`);
            process.chdir(`${__dirname}${levelsUp}${iteration.applicationName}`);

            util.log(`git push`);
            exec(`git push`, (error, stdout, stderr) => {
               util.log(`cd to: ${iteration.originalDir}`);
               process.chdir(iteration.originalDir);

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
            // Wait for build to succeed or fail
            async.whilst(
               function () {
                  return iteration.buildResult !== `failed` && iteration.buildResult !== `succeeded`;
               },
               function (finished) {
                  // Sleep before calling again. If you have too many
                  // test running at the same time VSTS will start to 
                  // Timeout. Might be DOS protection.
                  setTimeout(function () {
                     vsts.getBuilds(tfs, iteration.projectId, pat, userAgent, (err, builds) => {
                        if (builds.length > 0) {
                           iteration.buildId = builds[0].id;
                           iteration.buildResult = builds[0].result;
                        }
                        finished(err);
                     });
                  }, 30000 + Math.floor((Math.random() * 1000) + 1));
               },
               function (e) {
                  // Get the build log
                  vsts.getBuildLog(tfs, iteration.projectId, pat, iteration.buildId, userAgent, (e, logs) => {
                     util.log(`buildResult:\r\n${iteration.buildResult}\r\nlogs:\r\n`);
                     util.logJSON(logs);
                     assert.equal(iteration.buildResult, `succeeded`, logs);
                     done(e);
                  });
               }
            );
         });
      });

      context(`Release is running ${iteration.appType}`, function () {
         it(`release should succeed in dev`, function (done) {
            iteration.id = 0;
            iteration.status = ``;

            // Wait for release to succeed or fail
            async.whilst(
               function () {
                  return iteration.status !== `rejected` && iteration.status !== `succeeded` && iteration.status !== `partiallySucceeded`;
               },
               function (finished) {
                  // Sleep before calling again. If you have too many
                  // test running at the same time VSTS will start to 
                  // Timeout. Might be DOS protection.
                  setTimeout(function () {
                     vsts.getReleases(tfs, iteration.projectId, pat, userAgent, (err, r) => {
                        if (r.length > 0) {
                           iteration.status = r[0].environments[0].status;
                        }
                        finished(err);
                     });
                  }, 35000 + Math.floor((Math.random() * 1000) + 1));
               },
               function (e) {
                  // Get the release log
                  util.log(`iteration.status:\r\n${iteration.status}`);
                  assert.ok(iteration.status === `succeeded` || iteration.status === `partiallySucceeded`);
                  done(e);
               }
            );
         });

         if (iteration.target !== `docker`) {
            // Retry test up to 10 times
            // Some sites take a while to jit.
            this.retries(30);

            it(`dev site should be accessible`, function (done) {
               // Sleep before calling again. If you have too many
               // test running at the same time VSTS will start to 
               // Timeout. Might be DOS protection.
               setTimeout(function () {
                  azure.getAciIp(`${iteration.applicationName}Dev`, function (e, url) {
                     assert.ifError(e);
                     let fullUrl = `${url}:${dockerPorts}`;
                     util.log(`trying to access ${fullUrl}`);
                     try {
                        request({
                           url: fullUrl
                        }, function (err, res, body) {
                           assert.ifError(err);

                           var dom = cheerio.load(body);
                           util.log(`Page Title:\r\n${dom(`title`).text()}`);
                           assert.equal(dom(`title`).text(), `${iteration.title}`);
                           util.log(`+ dev site should be accessible`);

                           done();
                        });

                     } catch (error) {
                        // We need to catch any timeouts or the test will exit without
                        // re-trying. 
                        assert.fail(error);
                     }
                  });
               }, 30000 + Math.floor((Math.random() * 1000) + 1));
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
            function (inParallel) {
               // If find again because if the execution of the yo team command
               // fails the project might have been created but the test that
               // sets project id might not have been executed. 
               vsts.findProject(tfs, iteration.applicationName, pat, userAgent, (e, p) => {
                  if (p) {
                     iteration.projectId = p.id;
                     util.log(`delete project: ${iteration.projectId}`);
                     vsts.deleteProject(tfs, iteration.projectId, pat, userAgent, inParallel);
                  } else {
                     inParallel();
                  }
               });
            },
            function (inParallel) {
               util.log(`delete folder: ${iteration.applicationName}`);
               util.rmdir(iteration.applicationName);

               inParallel();
            },
            function (inParallel) {
               if (iteration.target !== `docker`) {
                  util.log(`delete resource group: ${iteration.applicationName}Dev`);
                  azure.deleteResourceGroup(`${iteration.applicationName}Dev`, inParallel);
               } else {
                  inParallel();
               }
            }
         ], done);
      });
   });
}

module.exports = {
   runTests: runTests
};