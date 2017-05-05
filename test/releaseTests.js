const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const stubs = require(`./stubs`);
const helpers = require(`yeoman-test`);
const sinonTest = require(`sinon-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const util = require(`../generators/app/utility`);
const release = require(`../generators/release/app`);

sinon.test = sinonTest.configureTest(sinon);

describe(`release:index`, () => {
   "use strict";

   it(`test prompts node dockerpaas vsts`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `dockerpaas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `dockerpaas`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts node dockerpaas tfs`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.findAzureServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Hosted Linux Preview`, expectedToken);
            stubs.findBuild(expectedAccount, `dockerpaas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `dockerpaas`, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts node docker vsts`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts node docker tfs`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts node paas`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.findAzureServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `node`,
            applicationName: `nodeDemo`,
            target: `paas`,
            azureSub: `azureSub`
         })
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            stubs.findProject(expectedAccount, `nodeDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `paas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `paas`, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts java docker`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, (error) => {
            cleanUp();
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            stubs.findProject(expectedAccount, `javaDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`test prompts java paas`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.getAzureSubs.restore();
         util.tryFindRelease.restore();
         util.findAzureServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `java`,
            applicationName: `javaDemo`,
            target: `paas`,
            azureSub: `azureSub`
         })
         .on(`error`, (error) => {
            cleanUp();
            console.log(`Oh Noes!`, error);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
            stubs.findProject(expectedAccount, `javaDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `paas`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `paas`, expectedToken);
            stubs.findAzureServiceEndpoint(expectedAccount, `azureSub`, expectedToken);
         })
         .on(`end`, (e) => {
            cleanUp();
         });
   });

   it(`test prompts asp docker vsts`, () => {
      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `vsts`;

      let cleanUp = () => {
         util.getPools.restore();
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindRelease.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/release/index`))
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
         .on(`error`, e => {
            cleanUp();
            console.log(`Oh Noes!`, e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            stubs.findProject(expectedAccount, `aspDemo`, expectedToken);
            stubs.findQueue(expectedAccount, `Default`, expectedToken);
            stubs.findBuild(expectedAccount, `docker`, expectedToken);
            stubs.tryFindRelease(expectedAccount, `docker`, expectedToken);
            stubs.findDockerServiceEndpoint(expectedAccount, expectedToken);
            stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });
});

describe(`release:app`, () => {
   "use strict";

   let expectedToken = `OnRva2Vu`;
   let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;

   it(`run with existing release should run without error`, sinon.test(function (done) {
      // Arrange
      stubs.findQueue(expectedAccount, `Default`, expectedToken, this);
      stubs.findDockerServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.findDockerRegistryServiceEndpoint(expectedAccount, expectedToken, this);
      stubs.tryFindRelease(expectedAccount, `paas`, expectedToken, this);
      stubs.findProject(expectedAccount, `e2eDemo`, expectedToken, this);
      stubs.findBuild(expectedAccount, `paas`, expectedToken, this);
      stubs.findAzureServiceEndpoint(expectedAccount, `AzureSub`, expectedToken, this);

      var logger = sinon.stub();
      logger.log = () => {};

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

   it(`run with error should return error`, sinon.test(function (done) {
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
      logger.log = () => {};

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
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         release.run(args, logger);
      }, e => {
         done();
         return true;
      });
   }));

   it(`findOrCreateRelease should create release paas`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, {
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
      logger.log = () => {};

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

   it.only(`findOrCreateRelease should create release docker vsts`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, {
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
      logger.log = () => {};

      var args = {
         build: {
            id: 1,
            name: `e2eDemo-CI`
         },
         queueId: `1`,
         appName: `e2eDemo`,
         approverId: `aid`,
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

   it(`findOrCreateRelease should return error if release create fails`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/release/app`, {
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
      logger.log = () => {};

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
      assert.throws(() => {
         proxyApp.findOrCreateRelease(args, logger, done);
      }, e => {
         done();
         return true;
      });
   }));
});