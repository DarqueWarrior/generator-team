const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
const assert = require(`assert`);
const helpers = require(`yeoman-test`);
const proxyquire = require(`proxyquire`);
const sinonTestFactory = require(`sinon-test`);
const build = require(`../../generators/build/app`);
const util = require(`../../generators/app/utility`);

const sinonTest = sinonTestFactory(sinon);

describe(`build:index`, function () {
   it(`test prompts tfs 2017 custom:paas should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `custom`,
            applicationName: `aspDemo`,
            customFolder: `myFolder`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts tfs 2017 asp:paas should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `asp`,
            applicationName: `aspDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts tfs 2017 aspFull:paas should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `aspFull`,
            applicationName: `aspDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts java:paas should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `java`,
            applicationName: `javaDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts node:paas should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `node`,
            applicationName: `nodeDemo`,
            target: `paas`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts node:docker should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `node`,
            applicationName: `nodeDemo`,
            target: `docker`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts asp:docker should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withPrompts({
            type: `asp`,
            applicationName: `aspDemo`,
            target: `docker`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Default`,
            pat: `token`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test prompts java:docker should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
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
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line node:docker should not return error`, function () {
      let cleanUp = function () {
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withArguments([`node`, `nodeDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line java:docker should not return error`, function () {
      let cleanUp = function () {
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withArguments([`java`, `javaDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line asp:docker should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });

   it(`test cmd line asp:docker should not return error`, function () {
      let cleanUp = function () {
         util.getPools.restore();
         util.findQueue.restore();
         util.getTargets.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.isTFSGreaterThan2017.restore();
         util.findDockerServiceEndpoint.restore();
         util.findDockerRegistryServiceEndpoint.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/build`))
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/DefaultCollection`,
            `Default`, `docker`,
            `DockerHost`, `DockerRegistryId`,
            `token`
         ])
         .on(`error`, function (error) {
            cleanUp();
            assert.fail(error);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getTargets`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
            });
         })
         .on(`end`, function () {
            // Using the yeoman helpers and sinonTest did not play nice
            // so clean up your stubs
            cleanUp();
         });
   });
});

describe(`build:app`, function () {
   "use strict";

   it(`getBuild asp tfs 2017 paas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_asp_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `asp`,
         target: `paas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild asp vsts pass`, function (done) {
      // Arrange 
      let expected = `vsts_asp_build.json`;

      // Act
      build.getBuild({
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

   it(`getBuild aspFull vsts pass`, function (done) {
      // Arrange 
      let expected = `vsts_aspFull_build.json`;

      // Act
      build.getBuild({
         type: `aspFull`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild asp tfs 2017 docker`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_asp_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `asp`,
         target: `docker`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild asp vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_asp_docker_build.json`;

      // Act
      build.getBuild({
         type: `asp`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild asp tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_asp_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild asp vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_asp_docker_build.json`;

      // Act
      build.getBuild({
         type: `asp`,
         target: `dockerpaas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild asp tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_asp_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `asp`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild asp vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_asp_docker_build.json`;

      // Act
      build.getBuild({
         type: `asp`,
         target: `acilinux`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild java tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_java_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `java`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild java vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_java_docker_build.json`;

      // Act
      build.getBuild({
         type: `java`,
         target: `dockerpaas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild java tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_java_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `java`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild java vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_java_docker_build.json`;

      // Act
      build.getBuild({
         type: `java`,
         target: `acilinux`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild java vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_java_docker_build.json`;

      // Act
      build.getBuild({
         type: `java`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild java vsts pass`, function (done) {
      // Arrange 
      let expected = `vsts_java_build.json`;

      // Act
      build.getBuild({
         type: `java`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild node vsts dockerpaas`, function (done) {
      // Arrange 
      let expected = `vsts_node_docker_build.json`;

      // Act
      build.getBuild({
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

   it(`getBuild node vsts acilinux`, function (done) {
      // Arrange 
      let expected = `vsts_node_docker_build.json`;

      // Act
      build.getBuild({
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

   it(`getBuild node vsts docker`, function (done) {
      // Arrange 
      let expected = `vsts_node_docker_build.json`;

      // Act
      build.getBuild({
         type: `node`,
         target: `docker`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild node vsts paas`, function (done) {
      // Arrange 
      let expected = `vsts_node_build.json`;

      // Act
      build.getBuild({
         type: `node`,
         target: `paas`,
         tfs: `vsts`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   });

   it(`getBuild node tfs 2017 acilinux`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_node_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `node`,
         target: `acilinux`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild node tfs 2017 dockerpaas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_node_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `node`,
         target: `dockerpaas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild node tfs 2017 docker`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_node_docker_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `node`,
         target: `docker`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`getBuild node tfs 2017 paas`, sinonTest(function (done) {
      // Arrange 
      let expected = `tfs_node_build.json`;
      this.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);

      // Act
      build.getBuild({
         type: `node`,
         target: `paas`,
         tfs: `http://tfs:8080/tfs/DefaultCollection`
      }, function (e, actual) {
         // Assert
         assert.equal(expected, actual);
         done(e);
      });
   }));

   it(`run with existing build should run without error`, sinonTest(function (done) {
      // Arrange
      // callsArgWith uses the first argument as the index of the callback function
      // to call and calls it with the rest of the arguments provided.
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, {
         value: "I`m a build."
      });
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

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

   it(`run with error should return error`, sinonTest(function (done) {
      // Arrange
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindBuild`).callsArgWith(4, new Error("boom"), null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

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
      assert.throws(function () {
         build.run(args, logger);
      }, function (e) {
         done();
         return true;
      });
   }));

   it(`findOrCreateBuild should create build paas`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/build/app`, {
         "request": requestStub
      });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

      // Create build
      requestStub.onCall(0).yields(null, {
         statusCode: 200
      }, {
         name: `build`
      });

      // Act

      let objs = {
         "tfs": `http://localhost:8080/tfs/DefaultCollection`,
         "teamProject": {
            name: `TeamProject`,
            id: 1
         },
         "token": 'token',
         "queueId": 1,
         "dockerEndpoint": null,
         "dockerRegistryEndpoint": null,
         "dockerRegistryId": null,
         "buildJson": "build.json",
         "target": 'paas'
      };
      proxyApp.findOrCreateBuild(
         objs, logger,

         function (e, bld) {
            assert.equal(e, null);
            assert.equal(bld.name, `build`);

            done();
         });
   }));

   it(`findOrCreateBuild should create build docker`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/build/app`, {
         "request": requestStub
      });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

      // Create build
      requestStub.onCall(0).yields(null, {
         statusCode: 200
      }, {
         name: `build`
      });

      let objs = {
         "tfs": `http://localhost:8080/tfs/DefaultCollection`,
         "teamProject": {
            name: `TeamProject`,
            id: 1
         },
         "token": 'token',
         "queueId": 1,
         "dockerEndpoint": "dockerHostEndpoint",
         "dockerRegistryEndpoint": {
            name: `dockerRegistryEndpoint`,
            url: ``,
            authorization: {
               parameters: {
                  registry: ``
               }
            }
         },
         "dockerRegistryId": "dockerRegistryId",
         "buildJson": "build.json",
         "target": 'docker'
      };
      // Act
      proxyApp.findOrCreateBuild(objs, logger,
         function (e, bld) {
            assert.equal(e, null);
            assert.equal(bld.name, `build`);

            done();
         });
   }));

   it(`findOrCreateBuild should return error if build create fails`, sinonTest(function (done) {
      // Arrange
      // This allows me to take control of the request requirement
      // without this there would be no way to stub the request calls
      var requestStub = sinon.stub();
      const proxyApp = proxyquire(`../../generators/build/app`, {
         "request": requestStub
      });

      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `tryFindBuild`).callsArgWith(4, null, undefined);
      this.stub(fs, `readFileSync`).returns(`{"name": "{{BuildDefName}}"}`);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `findProject`).callsArgWith(4, null, {
         value: "TeamProject",
         id: 1
      });

      var logger = sinon.stub();
      logger.log = function () {};

      // Create build
      requestStub.onCall(0).yields(null, {
         statusCode: 400
      }, undefined);

      // Act
      // I use the custom error validation method to call done
      // because my method is async 
      assert.throws(function () {
         proxyApp.findOrCreateBuild(`http://localhost:8080/tfs/DefaultCollection`, {
               name: `TeamProject`,
               id: 1
            },
            `token`, 1, null, null, null, `build.json`, `paas`, logger, null, done);
      }, function (e) {
         done();
         return true;
      });
   }));
});