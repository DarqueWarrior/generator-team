"use strict";
const path = require(`path`);
const fs = require(`fs-extra`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const sinonTest = require(`sinon-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../../generators/app/utility`);
const registry = require(`../../generators/registry/app`);

sinon.test = sinonTest.configureTest(sinon);

describe(`registry:index`, function () {
   "use strict";
   it(`test prompts registry should not return error`, function () {
      let cleanUp = function () {
         util.tryFindDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/registry/index`))
         .withPrompts({
            pat: `token`,
            applicationName: `aspDemo`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`
         })
         .on(`error`, function (error) {
            cleanUp();
            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
            sinon.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, null, {
               name: `endpoint`,
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs         
            cleanUp();
         });
   });

   it(`test cmd line registry should not return error`, function () {
      let cleanUp = function () {
         util.tryFindDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/registry/index`))
         .withArguments([
            `aspDemo`,
            `http://localhost:8080/tfs/DefaultCollection`,
            `dockerRegistry`,
            `dockerRegistryId`,
            `dockerRegistryPassword`,
            `token`
         ])
         .on(`error`, function (error) {
            cleanUp();
            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
            sinon.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, null, {
               name: `endpoint`,
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs         
            cleanUp();
         });
   });
});

describe(`registry:app`, function () {
   "use strict";

   it(`run with existing endpoint should run without error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });
      this.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, null, {
         name: `endpoint`,
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryPassword: `dockerRegistryPassword`
      };

      // Act
      registry.run(args, logger, (e, ep) => {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });
      this.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, new Error("boom"), null);

      var logger = sinon.stub();
      logger.log = function () {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryPassword: `dockerRegistryPassword`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         registry.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateDockerRegistryServiceEndpoint should create endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/registry/app`, {
         "request": requestStub
      });

      this.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, null, undefined);

      var logger = sinon.stub();
      logger.log = function () {};

      // Create Project
      requestStub.onCall(0).yields(null, {
         statusCode: 200
      }, {
         name: `endpoint`
      });

      // Act
      proxyApp.findOrCreateDockerRegistryServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`, `ProjectId`,
         `dockerRegistry`, `dockerRegistryId`, `dockerRegistryPassword`, `token`, logger, (e, ep) => {
            assert.equal(e, null);
            assert.equal(ep.name, `endpoint`);

            done();
         });
   }));

   it(`findOrCreateDockerRegistryServiceEndpoint should create endpoint`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/registry/app`, {
         "request": requestStub
      });

      this.stub(util, `tryFindDockerRegistryServiceEndpoint`).callsArgWith(4, null, undefined);

      this.stub(fs, `readFile`).callsFake((files, options, cb) => {
         if (cb === undefined) {
            cb = options;
         }

         cb(null, `contents`);
      });

      var logger = sinon.stub();
      logger.log = function () {};

      // Create Project
      requestStub.onCall(0).yields(null, {
         statusCode: 400
      }, null);

      // Act
      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         proxyApp.findOrCreateDockerRegistryServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`, `ProjectId`,
            `dockerRegistry`, `dockerRegistryId`, `dockerRegistryPassword`, `token`, logger, done);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateDockerRegistryServiceEndpoint should short circuit`, sinon.test(function (done) {
      // Arrange

      var logger = sinon.stub();
      logger.log = function () {};

      // Act
      registry.findOrCreateDockerRegistryServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`, `ProjectId`,
         null, null, null, `token`, logger, (e, ep) => {
            assert.equal(e, null);
            assert.equal(ep, null);

            done();
         });
   }));
});
