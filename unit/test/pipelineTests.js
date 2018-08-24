const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../../generators/app/utility`);

describe(`team:pipeline`, function () {
   // Set up common fakes
   let expectedToken = `OnRva2Vu`;
   let expectedApplicationName = `MyUnitTestApp`;
   let expectedAccount = `http://localhost:8080/tfs/defaultcollection`;

   let fakeFindProject = function (tfs, project, token, gen, callback) {
      assert.equal(expectedAccount, tfs, `findProject - TFS is wrong ${expectedAccount} != ${tfs}`);
      assert.equal(expectedToken, token, `findProject - Token is wrong ${expectedToken} != ${token}`);
      assert.equal(expectedApplicationName, project, `findProject - Project is wrong ${expectedApplicationName} != ${project}`);

      callback(null, {
         name: expectedApplicationName,
         id: 1
      });
   };

   let fakeIsTFSGreaterThan2017False = function (account, token, callback) {
      assert.equal(expectedToken, token, `isTFSGreaterThan2017 - Token is wrong ${expectedToken} != ${token}`);
      assert.equal(expectedAccount, account, `isTFSGreaterThan2017 - account is wrong ${expectedAccount} != ${account}`);

      callback(undefined, false);
   };

   let fakeFindQueue = function (name, account, teamProject, token, callback) {
      assert.equal(`default`, name, `findQueue - name is wrong 'default' != ${name}`);
      assert.equal(1, teamProject.id, `findQueue - team project is wrong 1 != ${teamProject.id}`);
      assert.equal(expectedToken, token, `findQueue - token is wrong ${expectedToken} != ${token}`);
      assert.equal(expectedAccount, account, `findQueue - Account is wrong ${expectedAccount} != ${account}`);

      callback(null, 1);
   };

   it(`asp paas using real dependencies`, function () {
      var deps = [
         // No docker gens are listed
         path.join(__dirname, `../../generators/azure`),
         path.join(__dirname, `../../generators/nuget`),
         path.join(__dirname, `../../generators/feed`),
         path.join(__dirname, `../../generators/build`),
         path.join(__dirname, `../../generators/release`)
      ];

      var cleanUp = function () {
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findAllQueues.restore();
         util.tryFindRelease.restore();
         util.tryFindPackageFeed.restore();
         util.isTFSGreaterThan2017.restore();
         util.findAzureServiceEndpoint.restore();
         util.tryFindNuGetServiceEndpoint.restore();
         util.tryFindAzureServiceEndpoint.restore();
      };

      // Defining the arguments this way and calling the function under test
      // with them makes refactoring easier.
      let type = `asp`;
      let pat = `token`;
      let target = `paas`;
      let dockerHost = ``;
      let dockerPorts = ``;
      let customFolder = ` `;
      let queue = `default`;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let azureSub = `AzureSub`;
      let tenantId = `TenantId`;
      let dockerRegistryId = ``;
      let azureSubId = `AzureSubId`;
      let dockerRegistryPassword = ``;
      let applicationName = expectedApplicationName;
      let servicePrincipalId = `servicePrincipalId`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let tfs = `http://localhost:8080/tfs/defaultcollection`;

      return helpers.run(path.join(__dirname, `../../generators/pipeline`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs,
            queue, target, azureSub, azureSubId, tenantId, servicePrincipalId,
            dockerHost, dockerCertPath, dockerRegistry, dockerRegistryId, dockerPorts,
            dockerRegistryPassword, servicePrincipalKey, pat, customFolder
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            // This will protect the code from changes in sub generator arguments
            // There was a bug where the token was not correct and this test would
            // have caught it.
            sinon.stub(util, `findProject`).callsFake(fakeFindProject);

            sinon.stub(util, `isTFSGreaterThan2017`).callsFake(fakeIsTFSGreaterThan2017False);

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake(function (account, projectId, sub, token, gen, callback) {
               assert.equal(1, projectId, `findAzureServiceEndpoint - ProjectId is wrong`);
               assert.equal(`AzureSub`, sub.name, `findAzureServiceEndpoint - AzureSub Name is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - TFS is wrong ${expectedAccount} != ${tfs}`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `tryFindAzureServiceEndpoint`).callsFake(function (account, projectId, sub, token, gen, callback) {
               assert.equal(expectedAccount, account, `tryFindAzureServiceEndpoint - TFS is wrong ${expectedAccount} != ${tfs}`);
               assert.equal(1, projectId, `tryFindAzureServiceEndpoint - ProjectId is wrong`);
               assert.equal(expectedToken, token, `tryFindAzureServiceEndpoint - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(`AzureSub`, sub.name, `tryFindAzureServiceEndpoint - AzureSub Name is wrong`);
               assert.equal(`servicePrincipalId`, sub.servicePrincipalId, `tryFindAzureServiceEndpoint - AzureSub servicePrincipalId is wrong`);
               assert.equal(`TenantId`, sub.tenantId, `tryFindAzureServiceEndpoint - AzureSub TenantId is wrong`);
               assert.equal(`AzureSubId`, sub.id, `tryFindAzureServiceEndpoint - AzureSub AzureSubId is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake(fakeFindQueue);

            sinon.stub(util, `findAllQueues`).callsFake(function (account, teamProject, token, callback) {
               assert.equal(expectedAccount, account, `findAllQueues - Account is wrong`);
               assert.equal(1, teamProject.id, `findAllQueues - team project is wrong`);
               assert.equal(expectedToken, token, `findAllQueues - Token is wrong  ${expectedToken} != ${token}`);

               callback(null, [{ name: 'Default', id: 1 }, { name: 'Hosted', id: 2 }]);
            });

            sinon.stub(util, `findBuild`).callsFake(function (account, teamProject, token, target, callback) {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(`paas`, target, `findBuild - target is wrong`);

               callback(null, {
                  value: "I`m a build.",
                  authoredBy: {
                     id: 1,
                     uniqueName: `uniqueName`,
                     displayName: `displayName`
                  }
               });
            });

            sinon.stub(util, `tryFindBuild`).callsFake(function (account, teamProject, token, target, callback) {
               assert.equal(expectedAccount, account, `tryFindBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `tryFindBuild - team project is wrong`);
               assert.equal(expectedToken, token, `tryFindBuild - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(`paas`, target, `tryFindBuild - target is wrong`);

               callback(null, {
                  value: "I`m a build.",
                  authoredBy: {
                     id: 1,
                     uniqueName: `uniqueName`,
                     displayName: `displayName`
                  }
               });
            });

            sinon.stub(util, `tryFindNuGetServiceEndpoint`).callsFake(function (account, projectId, token, gen, callback) {
               assert.equal(1, projectId, `tryFindNuGetServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `tryFindNuGetServiceEndpoint - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(expectedAccount, account, `tryFindNuGetServiceEndpoint - Account is wrong`);

               callback(null, {
                  value: "I`m a endpoint."
               });
            });

            sinon.stub(util, `tryFindPackageFeed`).callsFake(function (account, projectName, token, gen, callback) {
               assert.equal(expectedToken, token, `tryFindPackageFeed - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(expectedAccount, account, `tryFindPackageFeed - Account is wrong`);
               assert.equal(expectedApplicationName, projectName, `tryFindPackageFeed - team project is wrong aspDemo != ${projectName}`);

               callback(null, {
                  value: "I`m a feed."
               });
            });

            sinon.stub(util, `tryFindRelease`).callsFake(function (args, callback) {
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - Token is wrong  ${expectedToken} != ${args.token}`);
               assert.equal(`paas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });
         })
         .on(`end`, function () {
            cleanUp();
         });
   });

   it(`powershell using real dependencies`, function () {
      var deps = [
         // No docker gens are listed
         path.join(__dirname, `../../generators/azure`),
         path.join(__dirname, `../../generators/nuget`),
         path.join(__dirname, `../../generators/feed`),
         path.join(__dirname, `../../generators/build`),
         path.join(__dirname, `../../generators/release`)
      ];

      var cleanUp = function () {
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.findAllQueues.restore();
         util.tryFindRelease.restore();
         util.tryFindPackageFeed.restore();
         util.isTFSGreaterThan2017.restore();
         util.tryFindNuGetServiceEndpoint.restore();
      };

      // Defining the arguments this way and calling the function under test
      // with them makes refactoring easier.
      let type = `powershell`;
      let pat = `token`;
      let target = ``;
      let dockerHost = ``;
      let dockerPorts = ``;
      let customFolder = ` `;
      let queue = `default`;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let azureSub = `AzureSub`;
      let tenantId = `TenantId`;
      let dockerRegistryId = ``;
      let azureSubId = `AzureSubId`;
      let dockerRegistryPassword = ``;
      let applicationName = expectedApplicationName;
      let servicePrincipalId = `servicePrincipalId`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let tfs = `http://localhost:8080/tfs/defaultcollection`;

      return helpers.run(path.join(__dirname, `../../generators/pipeline`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs,
            queue, target, azureSub, azureSubId, tenantId, servicePrincipalId,
            dockerHost, dockerCertPath, dockerRegistry, dockerRegistryId, dockerPorts,
            dockerRegistryPassword, servicePrincipalKey, pat, customFolder
         ])
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            // This will protect the code from changes in sub generator arguments
            // There was a bug where the token was not correct and this test would
            // have caught it.
            sinon.stub(util, `findProject`).callsFake(fakeFindProject);

            sinon.stub(util, `isTFSGreaterThan2017`).callsFake(fakeIsTFSGreaterThan2017False);

            sinon.stub(util, `findQueue`).callsFake(fakeFindQueue);

            sinon.stub(util, `findAllQueues`).callsFake(function (account, teamProject, token, callback) {
               assert.equal(expectedAccount, account, `findAllQueues - Account is wrong`);
               assert.equal(1, teamProject.id, `findAllQueues - team project is wrong`);
               assert.equal(expectedToken, token, `findAllQueues - Token is wrong  ${expectedToken} != ${token}`);

               callback(null, [{ name: 'Default', id: 1 }, { name: 'Hosted', id: 2 }]);
            });

            sinon.stub(util, `findBuild`).callsFake(function (account, teamProject, token, target, callback) {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal('undefined', target, `findBuild - target is wrong: ${target}`);

               callback(null, {
                  value: "I`m a build.",
                  authoredBy: {
                     id: 1,
                     uniqueName: `uniqueName`,
                     displayName: `displayName`
                  }
               });
            });

            sinon.stub(util, `tryFindBuild`).callsFake(function (account, teamProject, token, target, callback) {
               assert.equal(expectedAccount, account, `tryFindBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `tryFindBuild - team project is wrong`);
               assert.equal(expectedToken, token, `tryFindBuild - Token is wrong  ${expectedToken} != ${token}`);
               assert.equal(`powershell`, target, `tryFindBuild - target is wrong`);

               callback(null, {
                  value: "I`m a build.",
                  authoredBy: {
                     id: 1,
                     uniqueName: `uniqueName`,
                     displayName: `displayName`
                  }
               });
            });

            let fakeNuGet = function (account, projectId, token, gen, callback) {
               assert.equal(expectedAccount, account, `tryFindNuGetServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `tryFindNuGetServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `tryFindNuGetServiceEndpoint - Token is wrong  ${expectedToken} != ${token}`);

               callback(null, {
                  statusCode: 200,
                  value: "I`m a endpoint."
               });
            };

            sinon.stub(util, `tryFindNuGetServiceEndpoint`).callsFake(fakeNuGet);
            sinon.stub(util, `findNuGetServiceEndpoint`).callsFake(fakeNuGet);

            let fakeFeed = function (account, projectName, token, gen, callback) {
               assert.equal(expectedAccount, account, `tryFindPackageFeed - Account is wrong`);
               assert.equal(applicationName, projectName, `tryFindPackageFeed - team project is wrong aspDemo != ${projectName}`);
               assert.equal(expectedToken, token, `tryFindPackageFeed - Token is wrong  ${expectedToken} != ${token}`);

               callback(null, {
                  statusCode: 200,
                  value: "I`m a feed."
               });
            };
            sinon.stub(util, `tryFindPackageFeed`).callsFake(fakeFeed); // Called by the Feed generator
            sinon.stub(util, `findPackageFeed`).callsFake(fakeFeed); // Called by the Release generator

            sinon.stub(util, `tryFindRelease`).callsFake(function (args, callback) {
               assert.equal(`undefined`, args.target, `tryFindRelease - target is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - Token is wrong  ${expectedToken} != ${args.token}`);

               callback(null, {
                  value: "I`m a release."
               });
            });
         })
         .on(`end`, function () {
            cleanUp();
         });
   });

   it(`prompts for azure should not compose with Docker`, function () {
      let deps = [
         // No docker gens are listed
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      let cleanUp = function () {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withPrompts({
            tfs: `vsts`,
            pat: `token`,
            queue: `Default`,
            type: `asp`,
            applicationName: `aspDemo`,
            target: `paas`,
            azureSub: `azureSub`,
            installDep: `false`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
         })
         .on(`end`, function (e) {
            cleanUp();
         });
   });

   it(`for azure should not compose with Docker`, function () {
      var deps = [
         // No docker gens are listed
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      return helpers.run(path.join(__dirname, `../../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/defaultcollection`,
            `default`, `paas`, `AzureSub`, `AzureSubId`, `TenantId`, `servicePrincipalId`,
            ``, ``, ``, ``, ``, ``,
            `servicePrincipalKey`, `token`
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });

   it(`for docker should not compose with azure`, function () {
      var deps = [
         // No azure gens are listed
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:docker`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`]
      ];

      // Defining the arguments this way and calling the function under test
      // with them makes refactorying easier.
      let type = `node`;
      let pat = `token`;
      let azureSub = ``;
      let tenantId = ``;
      let azureSubId = ``;
      let queue = `default`;
      let target = `docker`;
      let servicePrincipalId = ``;
      let servicePrincipalKey = ``;
      let dockerHost = `DockerHost`;
      let dockerPorts = `DockerPorts`;
      let applicationName = `nodeDemo`;
      let dockerCertPath = `DockerCert`;
      let dockerRegistry = `DockerRegistry`;
      let dockerRegistryId = `DockerUsername`;
      let dockerRegistryPassword = `DockerPassword`;
      let tfs = `http://localhost:8080/tfs/defaultcollection`;

      return helpers.run(path.join(__dirname, `../../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs,
            queue, target, azureSub, azureSubId, tenantId, servicePrincipalId,
            dockerHost, dockerCertPath, dockerRegistry, dockerRegistryId, dockerPorts,
            dockerRegistryPassword, servicePrincipalKey, pat
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });
});