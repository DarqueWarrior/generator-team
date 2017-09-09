const uuidV4 = require('uuid/v4');
const vsts = require(`./index.js`);
const env = require('node-env-file');
const assert = require(`yeoman-assert`);
const exec = require('child_process').exec;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
env(__dirname  +  '/.env', {
   raise: false,
   overwrite: true
});

const pat = process.env.PAT;
const acct = process.env.ACCT;
const dockerHost = process.env.DOCKER_HOST;
const dockerRegistry = process.env.DOCKER_REGISTRY;
const dockerRegistryUsername = process.env.DOCKER_REGISTRY_USERNAME;

describe.only(`Testing build`, function () {
   "use strict";

   let uuid = uuidV4();

   var iterations = [{
      appType: `asp`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `java`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `node`,
      target: `paas`,
      suffix: ``
   }, {
      appType: `aspFull`,
      target: `paas`,
      suffix: ``
   }];

   var projectId;
   var expectedName;
   var buildDefinitionId;
   var projectName = `buildTest${uuid.substring(0, 8)}`;

   // Arguments
   var queue;
   var dockerRegistryId;

   context(`Creating Project`, function () {
      before(function (done) {
         // runs before all tests in this block
         vsts.createProject(acct, projectName, pat, `yo Team`, (e, body) => {
            if (!e) {
               projectId = body.id;
            }
            done(e);
         });
      });

      iterations.forEach(function (iteration) {

         context(`Creating ${iteration.appType} build`, function () {

            it(`${iteration.appType} - ${projectName}${iteration.suffix}-CI build should be created`, (done) => {
               // Arrange
               expectedName = `${projectName}${iteration.suffix}-CI`;

               queue = `default`;
               dockerRegistryId = ``;

               // Act
               let cmd = `yo team:build ${iteration.appType} ${projectName} ${acct} ${queue} ${iteration.target} '${dockerHost}' '${dockerRegistry}' '${dockerRegistryId}' ${pat}`;

               exec(cmd, (error, stdout, stderr) => {
                  if (error) {
                     assert.fail(error);
                  }

                  // Assert
                  // Test to see if build was created
                  vsts.findBuildDefinition(acct, projectId, pat, expectedName, `yo Team`, (e, bld) => {
                     assert.ifError(e);
                     assert.ok(bld, `Build not created`);
                     buildDefinitionId = bld.id;
                     done(e);
                  });
               });
            });

            afterEach(function (done) {
               // runs after each test in this block
               vsts.deleteBuildDefinition(acct, projectId, buildDefinitionId, pat, `yo team`, e => {
                  done(e);
               });
            });
         });
      });

      after(function (done) {
         // runs after all tests in this block
         vsts.deleteProject(acct, projectId, pat, `yo team`, (e) => {
            done(e);
         });
      });
   });
});