const fs = require('fs');
const async = require('async');
const vsts = require(`./_index`);
const uuidV4 = require('uuid/v4');
const request = require('request');
const testUtils = require(`./_util`);
const env = require('node-env-file');
const util = require('../../generators/app/utility');
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;

const userAgent = `yo team`;

var __basedir = process.cwd();

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
var fileName = process.env.SERVER_TO_TEST || ``
env(__dirname + `/${fileName}.env`, {
   raise: false,
   overwrite: true
});

module.exports = {
   runTests: runTests
};

function runTests(iteration) {
   var feedId;
   var projectId;
   var originalDir = process.cwd();

   // RM has issues if you try to create a release on
   // a project name that was just deleted and recreated
   //So we gen a GUID and a portion to the applicationName
   // to help with that.
   let uuid = uuidV4();

   // Arguments
   var target = ` `;
   var installDep = `false`;
   var tfs = process.env.ACCT;
   var queue = iteration.queue;
   var pat = process.env.PAT || ` `;
   var applicationType = 'powershell';
   var groupId = iteration.appName || ` `;
   var apiKey = process.env.API_KEY || ` `;
   var azureSub = process.env.AZURE_SUB || ` `;
   var doNotCleanUp = process.env.DO_NOT_CLEAN_UP;
   var dockerHost = process.env.DOCKER_HOST || ` `;
   var customFolder = iteration.customFolder || ` `;
   var azureSubId = process.env.AZURE_SUB_ID || ` `;
   var dockerPorts = process.env.DOCKER_PORTS || ` `;
   var tenantId = process.env.AZURE_TENANT_ID || ` `;
   var functionName = process.env.FUNCTION_NAME || ` `;
   var dockerRegistry = process.env.DOCKER_REGISTRY || ` `;
   var dockerCertPath = process.env.DOCKER_CERT_PATH || ` `;
   var applicationName = iteration.appName + uuid.substring(0, 8);
   var servicePrincipalId = process.env.SERVICE_PRINCIPAL_ID || ` `;
   var servicePrincipalKey = process.env.SERVICE_PRINCIPAL_KEY || ` `;
   var dockerRegistryId = process.env.DOCKER_REGISTRY_USERNAME || ` `;
   var dockerRegistryPassword = process.env.DOCKER_REGISTRY_PASSWORD || ` `;

   var token = util.encodePat(pat);

   // The number of levels up from the folder the test are executed in to the 
   // folder where the repository was cloned.  This is not the same when run locally
   // vs. run on a build machine. 
   var levelsUp = process.env.LEVELS_UP || `/../`;

   context(`Running Yo Team ${iteration.appType}`, function () {
      this.bail(true);

      before(function (done) {
         // runs before all tests in this block
         // Run the command. The parts will be verified below.
         let cmd = `yo team ${applicationType} ${applicationName} ${tfs} ${azureSub} "${azureSubId}" ` +
            `"${tenantId}" "${servicePrincipalId}" "${queue}" "${target}" ${installDep} ` +
            `"${groupId}" "${dockerHost}" "${dockerCertPath}" "${dockerRegistry}" ` +
            `"${dockerRegistryId}" "${dockerPorts}" "${dockerRegistryPassword}" "${servicePrincipalKey}" ${pat} "${functionName}" "${apiKey}" "${customFolder}"`;

         testUtils.log(`run command: ${cmd}`);

         // Act
         // Execute yo team
         exec(cmd, (error, stdout, stderr) => {
            testUtils.log(`stdout: ${stdout}`);
            testUtils.log(`stderr: ${stderr}`);

            if (error) {
               // This may happen if yo team is not installed
               console.error(`exec error: ${error}`);
               parallel(error);
               return;
            }

            done(error);
         });
      });

      context(`Verify everything was created`, function () {
         it(`${applicationName} project should be created`, function (done) {
            // Arrange
            let expectedName = `${applicationName}`;

            testUtils.log(`Find project ${expectedName}`);

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

            testUtils.log(`Find build ${expectedName}`);

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

            testUtils.log(`Find release ${expectedName}`);

            vsts.findReleaseDefinition(tfs, projectId, pat, expectedName, userAgent, (e, r) => {
               // Assert
               assert.ifError(e);
               assert.ok(r, `release definition not found`);

               done(e);
            });
         });

         it(`PowerShell Gallery service endpoint should be created`, function (done) {
            // Arrange
            let expectedName = `PowerShell Gallery`;

            testUtils.log(`Find PowerShell Gallery service endpoint ${expectedName}`);

            util.findNuGetServiceEndpoint(tfs, projectId, token, null, (e, ep) => {
               // Assert
               assert.ifError(e);
               assert.ok(ep, `service endpoint not found`);
               testUtils.log(`+ Found service endpoint ${expectedName}`);

               done(e);
            });
         });

         it(`Package management feed should be created`, function (done) {
            // Arrange
            let expectedName = applicationName;

            testUtils.log(`Find package feed ${expectedName}`);

            util.findPackageFeed(tfs, expectedName, token, null, (e, feed) => {
               // Assert
               assert.ifError(e);
               assert.ok(feed, `package feed not found`);
               testUtils.log(`+ Found package feed ${expectedName}`);

               feedId = feed.id;

               done(e);
            });
         });

         it(`files should be created`, function () {
            assert.ok(fs.existsSync(applicationName));
         });
      });

      context(`Push code to remote`, function () {
         it(`git push should succeed`, function (done) {
            testUtils.log(`cd to: ${__basedir}${levelsUp}${applicationName}`);
            process.chdir(`${__basedir}${levelsUp}${applicationName}`);

            testUtils.log(`git push`);
            exec(`git push`, (error, stdout, stderr) => {
               testUtils.log(`cd to: ${originalDir}`);
               process.chdir(originalDir);

               if (error) {
                  // This may happen if git errors
                  console.error(`exec error: ${error}`);
                  done(error);
                  return;
               }

               testUtils.log(`stdout: ${stdout}`);
               testUtils.log(`stderr: ${stderr}`);

               done(error);
            });
         });

         // runs after all tests in this block
         after(function (done) {
            if (doNotCleanUp === `true`) {
               done();
               return;
            }

            // Delete files
            testUtils.log(`delete folder: ${applicationName}`);
            testUtils.rmdir(applicationName);
            done();
         });
      });

      context(`Build is running ${iteration.appType}`, function () {
         it(`build should succeed`, function (done) {
            let id = 0;
            let result = ``;

            // Wait for build to succeed or fail
            async.whilst(
               function () {
                  return result !== `failed` && result !== `succeeded` && result !== `partiallySucceeded`;
               },
               function (finished) {
                  // Sleep before calling again. If you have too many
                  // test running at the same time VSTS will start to 
                  // Timeout. Might be DOS protection.
                  setTimeout(function () {
                     vsts.getBuilds(tfs, projectId, pat, userAgent, (err, builds) => {
                        if (builds.length > 0) {
                           id = builds[0].id;
                           result = builds[0].result;
                        }
                        finished(err);
                     });
                  }, 15000 + Math.floor((Math.random() * 1000) + 1));
               },
               function (e) {
                  // Get the build log
                  vsts.getBuildLog(tfs, projectId, pat, id, userAgent, (e, logs) => {
                     testUtils.log(`buildResult:\r\n${result}\r\nlogs:\r\n`);
                     testUtils.logJSON(logs);
                     assert.equal(result, `succeeded`, JSON.stringify(JSON.parse(logs), null, 2));
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
                  // Sleep before calling again. If you have too many
                  // test running at the same time VSTS will start to 
                  // Timeout. Might be DOS protection.
                  setTimeout(function () {
                     vsts.getReleases(tfs, projectId, pat, userAgent, `Dev`, (err, r) => {
                        if (r !== undefined && r.length > 0) {
                           status = r[0].environments[0].status;
                        }

                        finished(err);
                     });
                  }, 15000 + Math.floor((Math.random() * 1000) + 1));
               },
               function (e) {
                  // Get the release log          
                  testUtils.log(`release in dev:\r\n${status}`);
                  assert.ok(status === `succeeded` || status === `partiallySucceeded`);
                  done(e);
               }
            );
         });

         it(`approval is waiting to qa`, function (done) {
            testUtils.log(`Find approval`);

            vsts.getApprovals(tfs, projectId, pat, userAgent, (e, a) => {
               // Assert
               assert.ifError(e);
               assert.ok(a, `approval not found`);

               approvalId = a.value[0].id;

               done(e);
            });
         });
      });

      // runs after all tests in this block
      after(function (done) {
         if (doNotCleanUp === `true`) {
            done();
            return;
         }

         // Delete files, project, and package feed.
         async.parallel([
            function(parallel) {
               vsts.findProject(tfs, applicationName, pat, userAgent, (e, p) => {
                  if (!e) {
                     testUtils.log(`delete project: ${p.id}`);
                     vsts.deleteProject(tfs, p.id, pat, userAgent, parallel);
                  }
               });
            },
            function(parallel) {
               vsts.deleteFeed(tfs, feedId, pat, userAgent, parallel);               
            }
         ], done);
      });
   });
}