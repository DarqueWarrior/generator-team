const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const stubs = require(`./stubs`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const sinonTestFactory = require(`sinon-test`);
const util = require(`../../generators/app/utility`);
const release = require(`../../generators/release/app`);

const sinonTest = sinonTestFactory(sinon);

describe(`release:index`, function () {
   "use strict";

   it(`test prompts node dockerpaas vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `dockerpaas`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `dockerpaas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `dockerpaas`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node dockerpaas tfs 2017`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.isTFSGreaterThan2017.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `dockerpaas`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `dockerpaas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `dockerpaas`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node aks vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `aks`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `aks`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `aks`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node aks tfs 2017`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.isTFSGreaterThan2017.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `aks`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `aks`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `aks`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node acilinux vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `acilinux`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `acilinux`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `acilinux`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         }).on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts node acilinux tfs 2017`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.isTFSGreaterThan2017.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            pat: `token`,
            queue: `Hosted Linux Preview`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `acilinux`,
            azureSub: `azureSub`,
            dockerHost: `dockerHost`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `acilinux`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `acilinux`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node docker vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `docker`,
            dockerHost: `dockerHost`,
            dockerRegistryId: `dockerRegistryId`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node docker tfs 2017`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            pat: `token`,
            queue: `Default`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `docker`,
            dockerHost: `dockerHost`,
            dockerRegistryId: `dockerRegistryId`,
            dockerPorts: `3000:3000`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);            
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node paasslots vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `paasslots`,
            azureSub: `azureSub`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `paasslots`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `paasslots`, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts node paas vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `paas`,
            azureSub: `azureSub`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `paas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `paas`, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts java docker vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `java`,
            applicationName: `javaDemo`,
            target: `docker`,
            dockerHost: `dockerHost`,
            dockerRegistryId: `dockerRegistryId`,
            dockerPorts: `8080:8080`
         })
         .on(`error`, function (error) {
            cleanUp();
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `javaDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts java paas vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findAzureServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `java`,
            applicationName: `javaDemo`,
            target: `paas`,
            azureSub: `azureSub`
         })
         .on(`error`, function (error) {
            cleanUp();
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `javaDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `paas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `paas`, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`test prompts asp docker vsts`, function () {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = function () {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.supportsLoadTests.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `asp`,
            applicationName: `aspDemo`,
            target: `docker`,
            dockerHost: `dockerHost`,
            dockerRegistryId: `dockerRegistryId`,
            dockerPorts: `80:80`
         })
         .on(`error`, function (e) {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `supportsLoadTests`).callsArgWith(2, null, true);
            stubs.findProject(expectedAccount, `aspDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });
});

describe(`release:app`, function () {
   "use strict";

   let expectedToken = `OnRva2Vu`;
   let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

   it(`getRelease asp tfs 2017 paas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `asp`,
         target: `paas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease asp vsts paasslots`, function (done) {
      // Arrange 
      let expected = `vsts_release_slots.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `paasslots`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getRelease asp vsts paas`, function (done) {
      // Arrange 
      let expected = `vsts_release.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getRelease aspFull vsts paasslots`, function (done) {
      // Arrange 
      let expected = `vsts_release_slots.json`;

      // Act
      release.getRelease({
         type: `aspFull`,
         target: `paasslots`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease aspFull vsts paas`, function (done) {
      // Arrange 
      let expected = `vsts_release.json`;

      // Act
      release.getRelease({
         type: `aspFull`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp tfs 2017 docker`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_docker.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `asp`,
         target: `docker`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease asp vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_release_docker.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_dockerpaas.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease asp tfs 2017 dockerpaas no Load Test`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_dockerpaas.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   // The West Central US region of VSTS does not support Load Test.
   // So we need to create a release that does not use that task.
   it(`getRelease java vsts paas no Load Test`, function (done) {
      // Arrange 
      let expected = `vsts_release_noloadtest.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `paas`,
         tfs: `vsts`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts paas slots no Load Test`, function (done) {
      // Arrange 
      let expected = `vsts_release_slots.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `paasslots`,
         tfs: `vsts`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts docker no Load Test`, function (done) {
      // Arrange 
      let expected = `vsts_release_docker.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `docker`,
         tfs: `vsts`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts acilinux no Load Test`, function (done) {
      // Arrange 
      let expected = `vsts_release_acilinux.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `acilinux`,
         tfs: `vsts`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp vsts dockerpaas no Load Test`, function (done) {
      // Arrange 
      let expected = `vsts_release_dockerpaas_noloadtest.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `vsts`,
         removeLoadTest: true
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_release_dockerpaas.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp vsts aks`, function (done) {
      // Arrange 
      let expected = `vsts_release_aks.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `aks`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease asp tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_acilinux.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `asp`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease asp vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_release_acilinux.json`;

      // Act
      release.getRelease({
         type: `asp`,
         target: `acilinux`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_dockerpaas.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `java`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease java vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_release_dockerpaas.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `dockerpaas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java tfs 2017 aks`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_aks.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `java`,
         target: `aks`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease java vsts aks`, function (done) {
      // Arrange 
      let expected = `vsts_release_aks.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `aks`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_acilinux.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `java`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease java vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_release_acilinux.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `acilinux`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_release_docker.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts paasslots`, function (done) {
      // Arrange 
      let expected = `vsts_release_slots.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `paasslots`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease java vsts paas`, function (done) {
      // Arrange 
      let expected = `vsts_release.json`;

      // Act
      release.getRelease({
         type: `java`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_release_dockerpaas.json`;

      // Act
      release.getRelease({
         type: `node`,
         target: `dockerpaas`,
         tfs: `vsts`,
         queue: `Hosted Linux Preview`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_release_acilinux.json`;

      // Act
      release.getRelease({
         type: `node`,
         target: `acilinux`,
         tfs: `vsts`,
         queue: `Hosted Linux Preview`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_release_docker.json`;

      // Act
      release.getRelease({
         type: `node`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node vsts paasslots`, function (done) {
      // Arrange 
      let expected = `vsts_release_slots.json`;

      // Act
      release.getRelease({
         type: `node`,
         target: `paasslots`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node vsts paas`, function (done) {
      // Arrange 
      let expected = `vsts_release.json`;

      // Act
      release.getRelease({
         type: `node`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getRelease node tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_acilinux.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `node`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease node tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_dockerpaas.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `node`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease node tfs 2018 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_2018_release_dockerpaas.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, true);

      // Act
      release.getRelease({
         type: `node`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease node tfs 2017 docker`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release_docker.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `node`,
         target: `docker`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease node tfs 2017 paas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_release.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      release.getRelease({
         type: `node`,
         target: `paas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getRelease node tfs 2018 paas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_2018_release.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, true);

      // Act
      release.getRelease({
         type: `node`,
         target: `paas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`run with existing release should run without error`, sinonTest(function (done) {
      // Arrange
      stubs.findQueue(expectedAccount, `Default`, expectedToken, this);
      stubs.findDockerServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.tryFindRelease(expectedAccount, `paas`, expectedToken, this);
      stubs.findProject(expectedAccount, `e2eDemo`, expectedToken, this);
      stubs.findBuild(expectedAccount, `paas`, expectedToken, this);
      stubs.findAzureServiceEndpoint(expectedAccount, `AzureSub`, expectedToken, this);

      var logger = sinon.stub();
      logger.log = function () {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         buildJson: `buildJson`,
         target: `paas`,
         dockerHost: `dockerHost`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`
      };

      // Act
      release.run(args, logger, (e, ep) => {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error`, sinonTest(function (done) {
      // Arrange
      this.stub(util, `tryFindRelease`).callsArgWith(1, new Error("boom"), null);
      this.stub(util, `findBuild`).callsArgWith(4, null, {
         value: "I`m a build.",
         id: 1,
         authoredBy: {
            id: 1,
            displayName: `displayName`,
            uniqueName: `uniqueName`
         }
      });

      stubs.findQueue(expectedAccount, `Default`, expectedToken, this);
      stubs.findDockerServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findProject(expectedAccount, `e2eDemo`, expectedToken, this);
      stubs.findAzureServiceEndpoint(expectedAccount, `AzureSub`, expectedToken, this);

      var logger = sinon.stub();
      logger.log = function () {};

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         azureSub: `AzureSub`,
         buildJson: `buildJson`,
         target: `docker`,
         dockerHost: `dockerHost`,
         dockerRegistry: `dockerRegistry`,
         dockerRegistryId: `dockerRegistryId`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to paas args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         release.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateRelease should create release paas`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/release/app`, {
         "request": requestStub
      });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });
      this.stub(util, `findBuild`).callsArgWith(4, null, {
         value: "I`m a build.",
         id: 1,
         authoredBy: {
            id: 1,
            displayName: `displayName`,
            uniqueName: `uniqueName`
         }
      });
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, {
         value: "I`m an endpoint.",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

      // Create release
      requestStub.onCall(0).yields(null, {
         statusCode: 200
      }, {
         name: `release`
      });

      var args = {
         build: {
            id: 1,
            name: `e2eDemo-CI`
         },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         account: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: {
            name: `teamProject`,
            id: 1
         },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `paas`
      };

      // Act
      proxyApp.findOrCreateRelease(args, logger, (e, rel) => {
         assert.equal(e, null);
         assert.equal(rel.name, `release`);

         done();
      });
   }));

   it(`findOrCreateRelease should create release docker vsts`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/release/app`, {
         "request": requestStub
      });

      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);

      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, null);

      stubs.findProject(expectedAccount, `e2eDemo`, expectedToken, this);
      stubs.findQueue(expectedAccount, `Default`, expectedToken, this);

      var logger = sinon.stub();
      logger.log = function () {};

      var args = {
         build: {
            id: 1,
            name: `e2eDemo-CI`
         },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         dockerRegistry: `https://mydockerimages-microsoft.azurecr.io`,
         account: `vsts`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: {
            name: `teamProject`,
            id: 1
         },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `docker`,
         dockerPorts: `80:80`,
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryEndpoint: {
            name: `dockerRegistryEndpoint`,
            url: ``,
            authorization: {
               parameters: {
                  registry: ``
               }
            }
         }
      };

      // Create release
      requestStub.onCall(0).yields(null, {
         statusCode: 403
      }, undefined);
      requestStub.onCall(1).yields(null, {
         statusCode: 200
      }, {
         name: `release`
      });

      // Act
      proxyApp.findOrCreateRelease(args, logger, (e, rel) => {
         assert.equal(e, null);
         assert.equal(rel.name, `release`);

         done();
      });
   }));

   it(`findOrCreateRelease should return error if release create fails`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/release/app`, {
         "request": requestStub
      });

      this.stub(fs, `readFileSync`).returns(`{"name": "{{ReleaseDefName}}"}`);

      this.stub(util, `tryFindRelease`).callsArgWith(1, null, undefined);

      stubs.findBuild(expectedAccount, `docker`, expectedToken, this);
      stubs.findQueue(expectedAccount, `Default`, expectedToken, this);
      stubs.findProject(expectedAccount, `e2eDemo`, expectedToken, this);
      stubs.findDockerServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findAzureServiceEndpoint(expectedAccount, `AzureSub`, expectedToken, this);

      var logger = sinon.stub();
      logger.log = function () {};

      // Create release
      requestStub.onCall(0).yields(null, {
         statusCode: 400
      }, undefined);

      var args = {
         build: {
            id: 1,
            name: `e2eDemo-CI`
         },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
         account: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         endpoint: `endpoint`,
         teamProject: {
            name: `teamProject`,
            id: 1
         },
         approverUniqueName: `approverUniqueName`,
         approverDisplayName: `approverDisplayName`,
         target: `docker`,
         dockerPorts: `80:80`,
         dockerHostEndpoint: {
            id: 1
         },
         dockerRegistryId: `dockerRegistryId`,
         dockerRegistryEndpoint: `dockerRegistryEndpoint`
      };

      // Act
      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         proxyApp.findOrCreateRelease(args, logger, done);
      }, function (e) {
         done();
         return true;
      });
   }));
});