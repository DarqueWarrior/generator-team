const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const helpers = require(`yeoman-test`);
const sinonTest = require(`sinon-test`);
const proxyquire = require(`proxyquire`);
const build = require(`../generators/build/app`);
const util = require(`../generators/app/utility`);

sinon.test = sinonTest.configureTest(sinon);

describe(`build:index`, function () {
   it(`test prompts asp:paas should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `asp`,
            applicationName: `aspDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts aspFull:paas should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `aspFull`,
            applicationName: `aspDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts java:paas should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `java`,
            applicationName: `javaDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts node:paas should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `node`,
            applicationName: `nodeDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts node:docker should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `node`,
            applicationName: `nodeDemo`,
            target: `docker`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts asp:docker should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `asp`,
            applicationName: `aspDemo`,
            target: `docker`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts java:docker should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withPrompts({
            type: `java`,
            applicationName: `javaDemo`,
            target: `docker`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`,
            dockerHost: `dockerHost`,
            dockerRegistryId: `dockerRegistryId`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line node:docker should not return error`, () => {
      let cleanUp = () => {
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withArguments([`node`, `nodeDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`])
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line java:docker should not return error`, () => {
      let cleanUp = () => {
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withArguments([`java`, `javaDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`])
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line asp:docker should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`])
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line asp:docker should not return error`, () => {
      let cleanUp = () => {
         util.getPools.restore();
         util.findQueue.restore();
         util.findDockerServiceEndpoint.restore();
         util.tryFindBuild.restore();
         util.findDockerRegistryServiceEndpoint.restore();
         util.findProject.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/build/index`))
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`])
         .on(`error`, error => {
            cleanUp();
            assert.fail(error);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });
         })
         .on(`end`, () => {
            // Using the yeoman helpers and sinon.test did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });
});

describe(`build:app`, () => {
   "use strict";

   it(`getBuild asp tfs paas`, () => {
      // Arrange 
      let expected = `tfs_asp_build.json`;

      // Act
      let actual = build.getBuild({ type: `asp`, target: `paas`, tfs: `http://tfs:8080/tfs/DefaultCollection` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild asp vsts pass`, () => {
      // Arrange 
      let expected = `vsts_asp_build.json`;

      // Act
      let actual = build.getBuild({ type: `asp`, target: `paas`, tfs: `vsts` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild aspFull vsts pass`, () => {
      // Arrange 
      let expected = `vsts_aspFull_build.json`;

      // Act
      let actual = build.getBuild({ type: `aspFull`, target: `paas`, tfs: `vsts` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild asp tfs docker`, () => {
      // Arrange 
      let expected = `tfs_asp_docker_build.json`;

      // Act
      let actual = build.getBuild({ type: `asp`, target: `docker`, tfs: `http://tfs:8080/tfs/DefaultCollection` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild asp vsts docker`, () => {
      // Arrange 
      let expected = `vsts_asp_docker_build.json`;

      // Act
      let actual = build.getBuild({ type: `asp`, target: `docker`, tfs: `vsts` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild java vsts docker`, () => {
      // Arrange 
      let expected = `vsts_java_docker_build.json`;

      // Act
      let actual = build.getBuild({ type: `java`, target: `docker`, tfs: `vsts` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`getBuild java vsts pass`, () => {
      // Arrange 
      let expected = `vsts_java_build.json`;

      // Act
      let actual = build.getBuild({ type: `java`, target: `paas`, tfs: `vsts` });

      // Assert
      assert.equal(expected, actual);
   });

   it(`run with existing build should run without error`, sinon.test(function (done) {
      // Arrange
      // callsArgWith uses the first argument as the index of the callback function
      // to call and calls it with the rest of the arguments provided.
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, { value: "I`m a build." });
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });

      var logger = sinon.stub();
      logger.log = () => { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         target: `paas`
      };

      // Act
      build.run(args, logger, function (e, ep) {
         assert.ok(!e);

         done();
      });
   }));

   it(`run with error should return error`, sinon.test(function (done) {
      // Arrange
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindBuild`).callsArgWith(4, new Error("boom"), null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });

      var logger = sinon.stub();
      logger.log = () => { };

      var args = {
         tfs: `http://localhost:8080/tfs/DefaultCollection`,
         pat: `token`,
         project: `e2eDemo`,
         queue: `Default`,
         target: `docker`
      };

      // Act
      // I have to use an anonymous function otherwise
      // I would be passing the return value of findOrCreateProject
      // instead of the function. I have to do this to pass args
      // to findOrCreateProject.

      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         build.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateBuild should create build paas`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/build/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });

      var logger = sinon.stub();
      logger.log = () => { };

      // Create build
      requestStub.onCall(0).yields(null, { statusCode: 200 }, { name: `build` });

      // Act
      proxyApp.findOrCreateBuild(`http://localhost:8080/tfs/DefaultCollection`, { name: `TeamProject`, id: 1 },
         `token`, 1, null, null, null, `build.json`, `paas`, logger, function (e, bld) {
            assert.equal(e, null);
            assert.equal(bld.name, `build`);

            done();
         });
   }));

   it(`findOrCreateBuild should create build docker`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/build/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });

      var logger = sinon.stub();
      logger.log = () => { };

      // Create build
      requestStub.onCall(0).yields(null, { statusCode: 200 }, { name: `build` });

      // Act
      proxyApp.findOrCreateBuild(`http://localhost:8080/tfs/DefaultCollection`, { name: `TeamProject`, id: 1 },
         `token`, 1, `dockerHostEndpoint`,
         { name: `dockerRegistryEndpoint`, url: ``, authorization: { parameters: { registry: `` } } },
         `dockerRegistryId`, `build.json`, `docker`, logger, function (e, bld) {
            assert.equal(e, null);
            assert.equal(bld.name, `build`);

            done();
         });
   }));

   it(`findOrCreateBuild should return error if build create fails`, sinon.test(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../generators/build/app`, { "request": requestStub });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, { value: "TeamProject", id: 1 });

      var logger = sinon.stub();
      logger.log = () => { };

      // Create build
      requestStub.onCall(0).yields(null, { statusCode: 400 }, undefined);

      // Act
      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(() => {
         proxyApp.findOrCreateBuild(`http://localhost:8080/tfs/DefaultCollection`, { name: `TeamProject`, id: 1 },
            `token`, 1, null, null, null, `build.json`, `paas`, logger, done);
      }, function (e) {
         done();
         return true;
      });
   }));
});