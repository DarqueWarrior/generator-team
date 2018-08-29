const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const sinonTestFactory = require(`sinon-test`);
const util = require(`../../generators/app/utility`);
const project = require(`../../generators/project/app`);

const sinonTest = sinonTestFactory(sinon);

describe(`project:index`, function () {
   "use strict";

   it(`project should be found prompts`, function () {
      var profiles = `
      [
         {
            "Name": "unitTest",
            "URL": "http://localhost:8080/tfs/defaultcollection",
            "Pat": "",
            "Type": "Pat",
            "Version": "TFS2017"
         },
         {
            "Name": "http://192.168.1.3:8080/tfs/defaultcollection",
            "URL": "http://192.168.1.3:8080/tfs/defaultcollection",
            "Pat": "OnE2cXpseHk0YXp3dHpz",
            "Type": "Pat",
            "Version": "TFS2017"
         },
         {
            "Name": "test",
            "URL": "https://test.visualstudio.com",
            "Pat": "OndrejR0ZHpwbDM3bXUycGt5c3hm",
            "Type": "Pat",
            "Version": "VSTS"
         }
      ]`;

      var spy;
      var utilTryFindProject;

      return helpers.run(path.join(__dirname, `../../generators/project`))
         .withPrompts({
            applicationName: `unitTest`,
            tfs: `unitTest`
         })
         .on(`error`, function (error) {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            util.tryFindProject.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            sinon.stub(fs, `existsSync`).returns(true);
            sinon.stub(fs, `readFileSync`).returns(profiles);
            generator.log = function() {}
            generator.log.ok = spy = sinon.spy();
            utilTryFindProject = sinon.stub(util, `tryFindProject`).callsArgWith(4, null, JSON.stringify({
               name: `unitTest`,
               id: 1
            }));
         })
         .on(`end`, function () {
            fs.existsSync.restore();
            fs.readFileSync.restore();
            util.tryFindProject.restore();

            var call = spy.getCall(0);
            assert.ok(call, `generator.log was not called`);

            var actual = call.args[0];
            assert.equal(`Found Team project`, actual, `generator.log was called with wrong value`);

            assert.equal(1, utilTryFindProject.callCount, `util.tryFindProject was not called`);
         });
   });

   it(`project should be found cmdLine`, function () {
      var spy;
      var utilTryFindProject;

      return helpers.run(path.join(__dirname, `../../generators/project`))
         .withArguments([`unitTest`, `http://localhost:8080/tfs/DefaultCollection`, `token`])
         .on(`error`, function (error) {
            util.tryFindProject.restore();

            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before generator.run() is called
            generator.log = function() {}
            generator.log.ok = spy = sinon.spy();
            utilTryFindProject = sinon.stub(util, `tryFindProject`).callsArgWith(4, null, JSON.stringify({
               name: `unitTest`,
               id: 1
            }));
         })
         .on(`end`, function () {
            var call = spy.getCall(0);
            assert.ok(call, `generator.log was not called`);

            var actual = call.args[0];
            assert.equal(`Found Team project`, actual, `generator.log was called with wrong value`);

            assert.equal(1, utilTryFindProject.callCount, `util.tryFindProject was not called`);

            util.tryFindProject.restore();
         });
   });
});

describe(`project:app`, function () {
   "use strict";

   it(`run with error should return error`, sinonTest(function (done) {
      // Arrange
      // return so the code thinks an error occurred 
      this.stub(util, `tryFindProject`).callsArgWith(4, new Error("boom"), null);

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`,
         log: function () {}
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         project.run(args);
      }, function (err) {
         done();
         return true;
      });
   }));

   it(`findOrCreateProject should create project`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/project/app`, {
         "request": requestStub
      });

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);
      // Create Project
      requestStub.onCall(0).yields(null, null, {
         name: `myProject`,
         url: `http://localhost:8080/tfs/_apis/projects/2`
      });
      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, {
         status: `succeeded`
      });

      // Get Project
      requestStub.onCall(1).yields(null, {
         statusCode: 200
      }, JSON.stringify({
         name: `myProject`,
         id: `myProjectID`
      }));

      let logger = function() {};
      logger.ok = function() {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`,
         log: logger
      };

      // Act
      proxyApp.findOrCreateProject(
         args,
         (err, data) => {
            // Assert
            assert.equal(`myProject`, data.name);
            assert.equal(`myProjectID`, data.id);

            done();
         });
   }));

   it(`findOrCreateProject should fail calling final GET`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/project/app.js`, {
         "request": requestStub
      });

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);

      // Create Project
      requestStub.onCall(0).yields(null, null, JSON.stringify({
         name: `myProject`
      }));

      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, {
         status: `succeeded`
      });

      // Get Project
      requestStub.onCall(1).yields({
         message: `Error sending request`
      }, null, undefined);

      let logger = function() {};
      logger.ok = function() {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`,
         log: logger
      };

      // Act
      proxyApp.findOrCreateProject(
         args,
         (err, data) => {
            // Assert
            assert.equal(`Error sending request`, err.message);

            done();
         });
   }));

   it(`findOrCreateProject should fail to find new project`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/project/app`, {
         "request": requestStub
      });

      // Setup the stub. This stub will be called with two arguments.
      // The first is an options object and the second is a callback
      // that receives three args.
      // 1. the error object
      // 2. the response object
      // 3. the JSON response
      // Find or Create
      // return so the code thinks the project was not found
      this.stub(util, `tryFindProject`).callsArgWith(4, null, undefined);

      // Create Project
      requestStub.onCall(0).yields(null, null, JSON.stringify({
         name: `myProject`
      }));
      // Check Status
      this.stub(util, `checkStatus`).callsArgWith(3, null, {
         status: `succeeded`
      });

      // Get Project
      requestStub.onCall(1).yields(null, {
         statusCode: 404
      }, null);

      let logger = function() {};
      logger.ok = function() {};
      logger.error = function() {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         appName: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         target: `paas`,
         releaseJson: `releaseJson`,
         log: logger
      };

      // Act
      proxyApp.findOrCreateProject(
         args,
         (err, data) => {
            // Assert
            assert.equal(`Unable to find newly created project.`, err.message);

            done();
         });
   }));
});