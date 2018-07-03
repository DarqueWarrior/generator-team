const path = require(`path`);
const fs = require(`fs`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const sinonTestFactory = require(`sinon-test`);
const util = require(`../../generators/app/utility`);
const build = require(`../../generators/build/app`);
const kubernetes = require(`../../generators/k8helmpipeline/app`);
const azure = require(`../../generators/azure/app`);
const release = require(`../../generators/release/app`);
//const kubernetes = require(`../../generators/k8helmpipeline/app`);

const sinonTest = sinonTestFactory(sinon);

describe(`k8helmpipeline:index`, function(){
   var deps = [
      path.join(__dirname, `../../generators/azure`),
      path.join(__dirname, `../../generators/build`),
      path.join(__dirname, `../../generators/release`)
   ];

   it(`test prompts k8helmpipeline should not return error for acs`, function () {
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;
      let expectedToken = `OnRva2Vu`;
      let cleanUp = function() {
         util.getPools.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.tryFindRelease.restore();
         util.findBuild.restore();
         util.getKubeEndpoint.restore();
         build.run.restore();
         release.run.restore();
      };
      
      let type = `kubernetes`;
      let pat = `token`;
      let target = `acs`;
      let dockerHost = ``;
      let dockerPorts = ``;
      let customFolder = ` `;
      let queue = `Hosted Linux Queue`;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let azureSub = `AzureSub`;
      let tenantId = `TenantId`;
      let dockerRegistryId = ``;
      let azureSubId = `AzureSubId`;
      let applicationName = 'kubeDemo';
      let dockerRegistryPassword = ``;
      let servicePrincipalId = `servicePrincipalId`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let tfs = `http://localhost:8080/tfs/DefaultCollection`;
      let kubeEndpointList = `Default`;
      let creationMode = `Automatic`;
      let endpointId = "12345";

      return helpers.run(path.join(__dirname, `../../generators/k8helmpipeline`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs, queue, target, azureSub, azureSubId, kubeEndpointList,
            tenantId, servicePrincipalId
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util,`getAzureSubs`).callsFake(function(){
               return ['Default'];
            });

            sinon.stub(kubernetes, `createArm`).callsFake(function(){
               let result = {
                  "sub" : {
                     "name": azureSub,
                     "id": azureSubId,
                     "tenantId": tenantId
                  },
                  "endpointId": endpointId
               };
               return new Promise(function(resolve, reject){
                  resolve(result);
               });
            });
            sinon.stub(util,`getKubeEndpoint`).callsFake(function(){
               return ['Default'];
            });
            
            sinon.stub(build, 'run').callsFake(function(args, _this, done){
               done();
            });
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });

            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });

            sinon.stub(util, `findBuild`).callsArgWith(4, null, {
               value: "I'm a build."
            });

            sinon.stub(release, 'run').callsFake(function(args, _this, done) {
               done();
            });

            sinon.stub(util, `tryFindRelease`).callsFake(function (args, callback) {
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - token is wrong`);
               assert.equal(`acs`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs        
            cleanUp();
         })
         .then(function(){
            let dir = process.cwd();
            assert.file(`Dockerfile`);
            assert.file(`index.html`);
            assert.file(`chart/${applicationName}/Chart.yaml`);
            assert.file(`chart/${applicationName}/values.yaml`);
            assert.file(`chart/${applicationName}/templates/NOTES.txt`);
            assert.file(`chart/${applicationName}/templates/_helpers.tpl`);
            assert.file(`chart/${applicationName}/templates/configmap.yaml`);
            assert.file(`chart/${applicationName}/templates/deployment.yaml`);
            assert.file(`chart/${applicationName}/templates/service.yaml`);
         });
   });
});

describe(`k8helmpipeline:app`, function(){
   context(`acsExtensionsCheckOrInstall`, function () {
      it(`should not fail`, sinonTest(function () {
         sinon.stub(kubernetes, 'acsExtensionsInstall').returns(true);
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(null, {
                  statusCode: 200
               }, JSON.stringify({
                  'extensionId': 'k8s-endpoint'
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsCheckOrInstall("default","token",(e, data) => {
            assert.equal(e, null);
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));

      it(`should return error`, sinonTest(function () {
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(true, {
                  statusCode: 400
               }, JSON.stringify({
                  'extensionId': 'k8s-endpoint'
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsCheckOrInstall("default","token",(e, data) => {
            assert.equal(e, true);
            kubernetes.acsExtensionsInstall.restore();
            done();
         }, function (e) {
            assert.fail();
            kubernetes.acsExtensionsInstall.restore();
            done();
         });
      }));
   });

   context(`acsExtensionsCheck`, function () {
      it(`should not fail`, sinonTest(function () {
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(null, {
                  statusCode: 200
               }, JSON.stringify({
                  "extensionId": "k8s-endpoint"
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsCheck("default",(e, data) => {
            assert.equal(e, null);
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));

      it(`should fail`, sinonTest(function () {
         //sinon.stub(kubernetes, 'acsExtensionsInstall').returns(true);
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(true, {
                  statusCode: 400
               }, JSON.stringify({
                  "default": "default"
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsCheck("default",(e, data) => {
            assert.equal(e, true);
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));
   });

   context(`acsExtensionsInstall`, function () {
      it(`should not fail`, sinonTest(function () {
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(null, {
                  statusCode: 200
               }, JSON.stringify({
                  "extensionId": "k8s-endpoint"
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsInstall("default",(e, data) => {
            assert.equal(e, null);
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));

      it(`should fail`, sinonTest(function () {
         //sinon.stub(kubernetes, 'acsExtensionsInstall').returns(true);
         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(true, {
                  statusCode: 400
               }, JSON.stringify({
                  "default": "default"
               }));
            }
         });
   
         // Act
         proxyApp.acsExtensionsInstall("default",(e, data) => {
            assert.equal(e, true);
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));
   });

   context(`createArm`, function(){
      let tfs = "tfs";
      let azureSub = "azureSub";
      let pat = "pat";
      let gen = "gen";
      let applicationName = "applicationName";

      function clean(){
         azure.createAzureServiceEndpoint.restore();
         util.findAzureSub.restore();
      }

      it(`should not fail`, sinonTest(function(){
         sinon.stub(util, 'findAzureSub').callsFake(function(){
            let azureSub = {
               "name": "name",
               "id": "id",
               "tenantId": "tenantId"
            };

         });
         sinon.stub(azure, 'createAzureServiceEndpoint').callsFake(function(){
            let endpointId = "stubEndpoint";
            callback(azureSub, gen, endpointId);
         });

         kubernetes.createArm(tfs, azureSub, pat, gen, applicationName, function(){
            assert.equal(azureSub.name, "name", "Subscription name not set");
            assert.equal(azureSub.id, "id", "Subscription id not set");
            assert.equal(azureSub.tenantId, "tenantId", "Subscription tenantId not set");
            assert.equal(gen, "gen", "Generator not set");
            assert.equal(endpointId, "stubEndpoint", "EndpointId not set");
         });

         clean();
      }));

      it(`should fail`, sinonTest(function(){
         kubernetes.createArm(tfs, azureSub, pat, gen, applicationName, function(error, sub, gen, endpointId){
            assert.equal(error, "Unable to create Service Endpoint. Configure manually", "Wrong error");
            assert.equal(sub, undefined, "Subscription should be undefined");
            assert.equal(gen, undefined, "Generator should be undefined");
            assert.equal(endpointId, undefined, "EndpointId should be undefined");
         })
      }))
   });
});

