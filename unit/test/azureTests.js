const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const sinonTest = require(`sinon-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../../generators/app/utility`);
const azure = require(`../../generators/azure/app`);

sinon.test = sinonTest.configureTest(sinon);

describe(`azure:index`, function () {
   it(`prompts vsts`, function () {
      var azureStub;

      return helpers.run(path.join(__dirname, `../../generators/azure/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            applicationName: `nodeDemo`,
            azureSub: `azureSub`
         })
         .on(`error`, function (e) {
            azure.run.restore();
            util.getAzureSubs.restore();

            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getAzureSubs`);

            azureStub = sinon.stub(azure, `run`).callsArgWith(2, null, null);
         })
         .on(`end`, function (e) {
            azure.run.restore();
            util.getAzureSubs.restore();

            let param0 = azureStub.getCall(0).args[0];
            assert.equal(`vsts`, param0.tfs);
         });
   });
});

describe(`azure:app`, function () {
   "use strict";

   it(`run with existing endpoint should run without error tfs`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, { name: `endpoint`, id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      azure.run(args, logger, function (e, ep) {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with existing endpoint should run without error vsts`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, { name: `endpoint`, id: 1 });
      this.stub(util, `findAzureSub`).callsArgWith(4, null, { displayName: "AzureSub", subscriptionId: 1, subscriptionTenantId: 2 });

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `vsts`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      azure.run(args, logger, function (e, ep) {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error vsts`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findAzureSub`).callsArgWith(4, null, undefined);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, { name: `endpoint`, id: 1 });

      var logger = sinon.stub();
      logger.log = function () { };
      logger.log.error = function () { };
      logger.env = { error: function () { } };

      var args = {
         tfs: `vsts`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      azure.run(args, logger, function (e, ep) {
         assert.ok(e);

         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, new Error("boom"), null);

      var logger = sinon.stub();
      logger.log = function () { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         servicePrincipalId: `servicePrincipalId`,
         queue: `Default`,
         azureSub: `AzureSub`,
         azureSubId: `azureSubId`,
         tenantId: `tenantId`,
         servicePrincipalKey: `servicePrincipalKey`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         azure.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateAzureServiceEndpoint should create endpoint Manual`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);

      var logger = sinon.stub();
      logger.log = function () { };

      // Create Project
      requestStub.onCall(0).yields(null, null, { name: `endpoint` });

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`http://localhost:8080/tfs/DefaultCollection`, `ProjectId`,
         { name: `SubName`, id: 1, tenantId: 2, servicePrincipalKey: `key`, servicePrincipalId: 3 }, `token`, logger, function (e, ep) {
            assert.equal(e, null);
            assert.equal(ep.name, `endpoint`);

            assert.equal(`Manual`, requestStub.getCall(0).args[0].body.data.creationMode);
            assert.equal(3, requestStub.getCall(0).args[0].body.authorization.parameters.serviceprincipalid, `serviceprincipalid is wrong`);
            assert.equal(`key`, requestStub.getCall(0).args[0].body.authorization.parameters.serviceprincipalkey, `serviceprincipalkey is wrong`);
            assert.equal(2, requestStub.getCall(0).args[0].body.authorization.parameters.tenantid, `tenantid is wrong`);

            done();
         });
   }));

   it(`findOrCreateAzureServiceEndpoint should create endpoint Automatic`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      let requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);
      this.stub(util, `checkStatus`).callsArgWith(3, null, { name: `endpoint`, operationStatus: { state: `Ready` } });

      var logger = sinon.stub();
      logger.log = function () { };

      // Create endpoint
      requestStub.onCall(0).yields(null, null, { name: `endpoint` });

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`vsts`, `ProjectId`,
         { name: `SubName`, tenantId: 5 }, `token`, logger, function (e, ep) {
            assert.equal(e, null);
            assert.equal(ep.name, `endpoint`);

            assert.equal(`Automatic`, requestStub.getCall(0).args[0].body.data.creationMode, `creationMode is wrong`);
            assert.equal(``, requestStub.getCall(0).args[0].body.authorization.parameters.serviceprincipalid, `serviceprincipalid is wrong`);
            assert.equal(``, requestStub.getCall(0).args[0].body.authorization.parameters.serviceprincipalkey, `serviceprincipalkey is wrong`);
            assert.equal(5, requestStub.getCall(0).args[0].body.authorization.parameters.tenantid, `tenantid is wrong`);

            done();
         });
   }));

   it(`findOrCreateAzureServiceEndpoint should return error if checkstatus fails`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      let requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);
      this.stub(util, `checkStatus`).callsArgWith(3, null, { operationStatus: { state: `Failed` } });

      var logger = sinon.stub();
      logger.log = function () { };
      logger.log.error = function () { };

      // Create endpoint
      requestStub.onCall(0).yields(null, null, { name: `endpoint` });

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`vsts`, `ProjectId`,
         { name: `SubName`, tenantId: 5 }, `token`, logger, function (e, ep) {
            assert.ok(e);

            done();
         });
   }));

   it(`findOrCreateAzureServiceEndpoint should return error if checkstatus has server error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      let requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);
      this.stub(util, `checkStatus`).callsArgWith(3, `boom`, undefined);

      var logger = sinon.stub();
      logger.log = function () { };
      logger.log.error = function () { };

      // Create endpoint
      requestStub.onCall(0).yields(null, null, { name: `endpoint` });

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`vsts`, `ProjectId`,
         { name: `SubName`, tenantId: 5 }, `token`, logger, function (e, ep) {
            assert.ok(e);

            done();
         });
   }));

   it(`findOrCreateAzureServiceEndpoint should return error`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      let requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/azure/app`, { "request": requestStub });

      this.stub(util, `tryFindAzureServiceEndpoint`).callsArgWith(5, null, undefined);
      this.stub(util, `checkStatus`).callsArgWith(3, null, { name: `endpoint`, operationStatus: { state: `Ready` } });

      var logger = sinon.stub();
      logger.log = function () { };

      // Create endpoint
      requestStub.onCall(0).yields(`boom`, null, undefined);

      // Act
      proxyApp.findOrCreateAzureServiceEndpoint(`vsts`, `ProjectId`,
         { name: `SubName`, tenantId: 5 }, `token`, logger, function (e, ep) {
            assert.ok(e);

            done();
         });
   }));
});