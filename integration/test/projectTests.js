const path = require(`path`);
const vsts = require(`./index.js`);
const request = require('request');
const env  =  require('node-env-file');
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

env(__dirname  +  '/.env', {
   raise: false,
   overwrite: true
});

const pat = process.env.PAT;
const acct = process.env.ACCT;

describe(`project:index cmdLine`, () => {
   "use strict";

   var projectId;
   var expectedProjectName = `intTest`;

   before(function (done) {
      // runs before all tests in this block
      vsts.findProject(acct, expectedProjectName, pat, `yo Team`, (e, project) => {
         assert.equal(project, undefined, `Precondition not meet: Project already exist`);
         done(e);
      });
   });

   it(`project should be created`, (done) => {
      // Arrange
      helpers.run(path.join(__dirname, `../../generators/project/index`))
         .withArguments([expectedProjectName, acct, pat])
         .on(`error`, (error) => {
            assert.fail(error);
         })
         .on(`ready`, (generator) => {
            // This is called right before generator.run() is called
         })
         .on(`end`, () => {
            // Test to see if project was created
            vsts.findProject(acct, expectedProjectName, pat, `yo Team`, (e, project) => {
               assert.ifError(e);
               projectId = project.id;
               assert.equal(project.name, expectedProjectName, `Wrong project returned`);
               done(e);
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