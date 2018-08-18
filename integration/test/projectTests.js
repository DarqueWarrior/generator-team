const path = require(`path`);
const request = require(`request`);
const vsts = require(`./_index`);
const env = require(`node-env-file`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const exec = require(`child_process`).exec;

// Try to read values from .env. If that fails
// simply use the environment vars on the machine.
var fileName = process.env.SERVER_TO_TEST || ``
env(__dirname +  `/${fileName}.env`, {
   raise: false,
   overwrite: true
});

const pat = process.env.PAT;
const tfs = process.env.ACCT;

describe(`project:index cmdLine`, function () {
   "use strict";

   var projectId;
   var expectedProjectName = `intTest`;

   before(function (done) {
      // runs before all tests in this block
      vsts.findProject(tfs, expectedProjectName, pat, `yo Team`, (e, project) => {
         assert.equal(project, undefined, `Precondition not meet: Project already exist`);
         done(e);
      });
   });

   it(`project should be created`, function (done) {
      // Act
      let cmd = `yo team:project ${expectedProjectName} ${tfs} ${pat}`;
      
      exec(cmd, (error, stdout, stderr) => {
         if (error) {
            assert.fail(error);
         }

         // Assert
         // Test to see if project was created
         vsts.findProject(tfs, expectedProjectName, pat, `yo Team`, (e, project) => {
            assert.ifError(e);
            assert.ok(project, `project not found`);

            // Store ID so I can delete the project
            projectId = project.id;
            assert.equal(project.name, expectedProjectName, `Wrong project returned`);
            done(e);
         });
      });
   });

   after(function (done) {
      // runs after all tests in this block
      vsts.deleteProject(tfs, projectId, pat, `yo team`, function (e) {
         done(e);
      });
   });
});