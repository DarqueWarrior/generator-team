const fs = require('fs');
const async = require('async');
const util = require(`./util`);
const vsts = require(`./index`);
const azure = require(`./azure`);
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

describe(`Azure Container Instances (Linux) using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   }, {
      appType: `asp`,
      appName: `aspACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   }, {
      appType: `java`,
      appName: `javaACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   }];

   iterations.forEach(runTests);
});

if (util.isVSTS(tfs)) {
   describe(`Azure Container Instances (Linux) using Hosted Linux Preview queue`, function () {
      "use strict";
      var iterations = [{
         appType: `node`,
         appName: `nodeACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: ` `,
         title: `Home Page - My Express Application`
      }, {
         appType: `asp`,
         appName: `aspACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: ` `,
         title: `Home Page - My .NET Core Application`
      }, {
         appType: `java`,
         appName: `javaACITest`,
         target: `acilinux`,
         queue: `Hosted Linux Preview`,
         groupId: `integrationTest`,
         title: `Home Page - My Spring Application`
      }];

      iterations.forEach(runTests);
   });
}

describe(`Docker Host using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodeDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   }, {
      appType: `asp`,
      appName: `aspDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   }, {
      appType: `java`,
      appName: `javaDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: `integrationTest`,
      title: `Home Page - My Spring Application`
   }];

   iterations.forEach(runTests);
});

function runTests(iteration) {
   "use strict";

   iteration.originalDir = process.cwd();

   // RM has issues if you try to create a release on
   // a project name that was just deleted and recreated
   //So we gen a GUID and a portion to the applicationName
   // to help with that.
   iteration.uuid = uuidV4();

   // Arguments
   iteration.applicationName = iteration.appName + iteration.uuid.substring(0, 8);

   var installDep = `false`;
   context(`${iteration.appType}`, function () {
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
      });

      context(`Verify everything was created`, function () {
         it(`${iteration.applicationName} project should be created`, function (done) {
            // Arrange
            util.log(`Find project ${iteration.applicationName}`);

            vsts.findProject(tfs, iteration.applicationName, pat, userAgent, (e, p) => {
               // Assert
               assert.ifError(e);
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
               assert.ifError(e);
               assert.ok(b, `build definition not found`);

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
               () => {
                  return iteration.buildResult !== `failed` && iteration.buildResult !== `succeeded`;
               },
               (finished) => {
                  vsts.getBuilds(tfs, iteration.projectId, pat, userAgent, (err, builds) => {
                     if (builds.length > 0) {
                        iteration.buildId = builds[0].id;
                        iteration.buildResult = builds[0].result;
                     }
                     finished(err);
                  });
               },
               (e) => {
                  // Get the build log
                  vsts.getBuildLog(tfs, iteration.projectId, pat, iteration.buildId, userAgent, (e, logs) => {
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
               () => {
                  return iteration.status !== `rejected` && iteration.status !== `succeeded` && iteration.status !== `partiallySucceeded`;
               },
               (finished) => {
                  vsts.getReleases(tfs, iteration.projectId, pat, userAgent, (err, r) => {
                     if (r.length > 0) {
                        iteration.status = r[0].environments[0].status;
                     }
                     finished(err);
                  });
               },
               (e) => {
                  // Get the release log            
                  assert.ok(iteration.status === `succeeded` || iteration.status === `partiallySucceeded`);
                  done(e);
               }
            );
         });

         if (iteration.target !== `docker`) {
            it(`dev site should be accessible`, function (done) {
               // Retry test up to 4 times
               // Some sites take a while to jit.
               this.retries(4);

               azure.getAciIp(`${iteration.applicationName}Dev`, function (e, url) {
                  assert.ifError(e);
                  util.log(`trying to access ${url}`);
                  request({
                     url: url
                  }, function (err, res, body) {
                     assert.ifError(err);

                     var dom = cheerio.load(body);
                     assert.equal(dom(`title`).text(), `${iteration.title}`);

                     done();
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
            (inParallel) => {
               util.log(`delete folder: ${iteration.applicationName}`);
               util.rmdir(iteration.applicationName);

               inParallel();
            },
            (inParallel) => {
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