const path = require(`path`);
const vsts = require(`./index.js`);
const request = require('request');
const env = require('node-env-file');
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

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

describe.only(`build:index cmdLine`, () => {
   "use strict";

   var projectId;
   var expectedName;
   var buildDefinitionId;
   var projectName = `buildTest`;

   before(function (done) {
      // runs before all tests in this block
      vsts.findProject(acct, projectName, pat, `yo Team`, (e, project) => {
         assert.equal(project, undefined, `Precondition not meet: Project already exist`);
         vsts.createProject(acct, projectName, pat, `yo Team`, (e, body) => {
            if (!e) {
               projectId = body.id;
            }
            done(e);
         });
      });
   });

   it(`.net core build should be created`, (done) => {
      // Arrange
      expectedName = `buildTest-CI`;

      // Act
      helpers.run(path.join(__dirname, `../../generators/build/index`))
         .withArguments([`asp`, projectName, acct, `default`, `paas`, ``, ``, ``, pat])
         .on(`error`, (error) => {
            assert.fail(error);
         })
         .on(`end`, () => {
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

   after(function (done) {
      // runs after all tests in this block
      vsts.deleteProject(acct, projectId, pat, `yo team`, (e) => {
         done(e);
      });
   });
});