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
const utility = require('util');
const yeoman = require('yeoman-generator');
const sinonTest = sinonTestFactory(sinon);

describe(`k8helmpipeline:index`, function() {
      this.timeout(2500);
      var deps = [
            path.join(__dirname, `../../generators/build`),
            path.join(__dirname, `../../generators/release`)
   ]  ;

      let type = `kubernetes`;
      let pat = `token`;
      let target = `acs`;
      let customFolder = ` `;
      let queue = `Hosted Linux Queue`;
      let azureSub = `AzureSub`;
      let tenantId = `TenantId`;
      let azureSubId = `AzureSubId`;
      let applicationName = 'kubeDemo';
      let servicePrincipalId = `servicePrincipalId`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let tfs = `http://localhost:8080/tfs/DefaultCollection`;
      let kubeEndpointList = `Default`;
      let creationMode = `Automatic`;
      let endpointId = "12345";
      let kubeEndpoint = "12345";
      let azureRegistryName = "RegistryName";
      let azureRegistryResourceGroup = "RegistryResourceGroup";
      let imagePullSecrets = "Secret";
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;
      let expectedToken = `OnRva2Vu`;
      let gen = yeoman;

   it(`test prompts k8helmpipeline should not return error for acs`, function () {
      let cleanUp = function() {
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.tryFindRelease.restore();
         util.findBuild.restore();
         util.getKubeEndpoint.restore();
         build.run.restore();
         release.run.restore();
         util.getAzureSubs.restore();
         kubernetes.createArm.restore();
         kubernetes.getKubeInfo.restore();
         kubernetes.acsExtensionsCheckOrInstall.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/k8helmpipeline`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs, queue, target, azureSub, azureSubId, kubeEndpointList,
            tenantId, servicePrincipalId, servicePrincipalKey, pat, customFolder, azureRegistryName, azureRegistryResourceGroup, imagePullSecrets
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util,`getKubeEndpoint`).callsFake(function(){
                  return ['Default'];
               });
            sinon.stub(util,`getAzureSubs`).callsFake(function() {
               return ['Default'];
            });

            sinon.stub(kubernetes, `acsExtensionsCheckOrInstall`).returns();
            let createArm = sinon.stub(kubernetes, `createArm`);
            createArm.callsFake(function(tfsName, azureSubName, token, gen, appName) {
               assert.equal(tfsName, tfs, "TFS is not passed down correctly");
               assert.equal(azureSubName, azureSub, "azureSub is not passed down correctly");   
               assert.equal(token, pat, "pat is not passed down correctly");
               assert.equal(appName, applicationName, `applicationName is not passed down correctly.`);
               let result = {
                  "sub" : {
                     "name": azureSub,
                     "id": azureSubId,
                     "tenantId": tenantId
                  },
                  "endpointId": endpointId
               };
               return new Promise(function(resolve, reject) {
                  resolve(result);
               });
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
            assert.equal(sinon.stub(kubernetes, 'getKubeInfo').called, false);
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

   it(`test prompts k8helmpipeline should not return error for aks`, function () {
      let cleanUp = function() {
         util.getPools.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.tryFindRelease.restore();
         util.findBuild.restore();
         util.getKubeEndpoint.restore();
         build.run.restore();
         release.run.restore();
         kubernetes.getKubeInfo.restore();
      };

      target = 'aks';

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

            let getKubeInfo = sinon.stub(kubernetes, `getKubeInfo`);
            getKubeInfo.callsFake(function(appName, tfs, pat, serviceEndpoint, kubeEndpoint, gen, callback) {
                  callback(undefined, {
                        "name": "name",
                        "resourceGroup": "resourceGroup"
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

            let kubeInfo = {
               "resourceGroup": "kubeResourceGroup",
               "name": "kubeName"
            };

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
      function cleanUp() {
         kubernetes.acsExtensionsInstall.restore()
      }
      sinon.stub(kubernetes, 'acsExtensionsInstall').returns(true);
      it(`should not fail`, sinonTest(function () {
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
            done();
         }, function (e) {
            assert.fail();
            done();
         });
      }));

      cleanUp();
   });

   context(`acsExtensionsCheck`, function () {
      function cleanUp() {
         kubernetes.acsExtensionsInstall.restore()
      }
      sinon.stub(kubernetes, 'acsExtensionsInstall').returns(true);
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
      cleanUp();
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

   context(`createArm`, function() {
      function cleanUp() {
         util.findAzureSub.restore();
         azure.createAzureServiceEndpoint.restore();
      }

      let tfs = "tfs";
      let azureSub = "azureSub";
      let pat = "pat";
      let gen = "gen";
      let applicationName = "applicationName";

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

         cleanUp();
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

   context(`getKubeInfo`, function() {

      let pat = `token`;
      let applicationName = 'kubeDemo';
      let tfs = `http://localhost:8080/tfs/DefaultCollection`;
      let endpointId = "12345";
      let kubeEndpoint = "12345";
      let gen = yeoman;
      gen.log = function(args) {
            console.log(args)
      }

      it(`should return the correct k8s information`, sinonTest(function() {

         const proxyApp = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback(undefined, {
               }, {
                  "result": ["kubeInfo"],
                  'statusCode': 'ok'
               });
            }
         });
            
         let expected = "kubeInfo";
         let kubernetesInfo = {
            "resourceGroup": expected, 
            "name": expected
         };

         proxyApp.getKubeInfo(applicationName, tfs, pat, endpointId, kubeEndpoint, gen, function(e, kubernetesInfo) {
            assert.equal(e, undefined);
            assert.equal(kubernetesInfo['resourceGroup'], expected, "Kubernetes Resource Group is not correct");
            assert.equal(kubernetesInfo['name'], expected, "Kubernetes Name is not correct");
         });
      }));

      it(`should handle error`, sinonTest(function() {
         const proxy = proxyquire(`../../generators/k8helmpipeline/app`, {
            "request": (options, callback) => {
               callback("Error", {
                  statusCode: 400
               }, {

               });
            }
         });
         let expected = "Error";
         proxy.getKubeInfo(applicationName, tfs, pat, endpointId, kubeEndpoint, gen, function(e, kubernetesInfo) {
            assert.equal(e, expected);
            assert.equal(kubernetesInfo, undefined);
         });
      }));

      it(`should handle errorCode in body`, sinonTest(function() {
            const proxy = proxyquire(`../../generators/k8helmpipeline/app`, {
                  "request": (options, callback) => {
                  callback("Error", {
                  }, {
                        'errorCode': '0'
                  });
                  }
            });
            let expected = "Error";
            proxy.getKubeInfo(applicationName, tfs, pat, endpointId, kubeEndpoint, gen, function(e, kubernetesInfo) {
            assert.equal(e, expected);
            assert.equal(kubernetesInfo, undefined);
         });
      }));
   });
});
