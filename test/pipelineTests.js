const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../generators/app/utility`);

describe(`team:pipeline`, () => {
   it(`using real dependencies`, () => {
      var deps = [
         // No docker gens are listed
         path.join(__dirname, `../generators/azure/index`),
         path.join(__dirname, `../generators/build/index`),
         path.join(__dirname, `../generators/release/index`)
      ];

      let expectedToken = `OnRva2Vu`;
      let expectedAccount = `http://localhost:8080/tfs/defaultcollection`;

      var cleanUp = () => {
         util.findBuild.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.tryFindRelease.restore();
         util.findAzureServiceEndpoint.restore();
         util.tryFindAzureServiceEndpoint.restore();
      };

      // Defining the arguments this way and calling the function under test
      // with them makes refactorying easier.
      let type = `asp`;
      let pat = `token`;
      let target = `paas`;
      let dockerHost = ``;
      let dockerPorts = ``;
      let queue = `default`;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let azureSub = `AzureSub`;
      let tenantId = `TenantId`;
      let dockerRegistryId = ``;
      let azureSubId = `AzureSubId`;
      let applicationName = `aspDemo`;
      let dockerRegistryPassword = ``;
      let servicePrincipalId = `servicePrincipalId`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let tfs = `http://localhost:8080/tfs/defaultcollection`;

      return helpers.run(path.join(__dirname, `../generators/pipeline/index`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs,
            queue, target, azureSub, azureSubId, tenantId, servicePrincipalId,
            dockerHost, dockerCertPath, dockerRegistry, dockerRegistryId, dockerPorts,
            dockerRegistryPassword, servicePrincipalKey, pat
         ])
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called.
            // This will protect the code from changes in sub generator arguments
            // There was a bug where the token was not correct and this test would
            // have caught it.
            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`aspDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - TFS is wrong`);
               assert.equal(1, projectId, `findAzureServiceEndpoint - ProjectId is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - Token is wrong`);
               assert.equal(`AzureSub`, sub.name, `findAzureServiceEndpoint - AzureSub Name is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `tryFindAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `tryFindAzureServiceEndpoint - TFS is wrong`);
               assert.equal(1, projectId, `tryFindAzureServiceEndpoint - ProjectId is wrong`);
               assert.equal(expectedToken, token, `tryFindAzureServiceEndpoint - Token is wrong`);
               assert.equal(`AzureSub`, sub.name, `tryFindAzureServiceEndpoint - AzureSub Name is wrong`);
               assert.equal(`servicePrincipalId`, sub.servicePrincipalId, `tryFindAzureServiceEndpoint - AzureSub servicePrincipalId is wrong`);
               assert.equal(`TenantId`, sub.tenantId, `tryFindAzureServiceEndpoint - AzureSub TenantId is wrong`);
               assert.equal(`AzureSubId`, sub.id, `tryFindAzureServiceEndpoint - AzureSub AzureSubId is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`default`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
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

            sinon.stub(util, `tryFindBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `tryFindBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `tryFindBuild - team project is wrong`);
               assert.equal(expectedToken, token, `tryFindBuild - token is wrong`);
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

            sinon.stub(util, `tryFindRelease`).callsFake((args, callback) => {
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - token is wrong`);
               assert.equal(`paas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`prompts for azure should not compose with Docker`, () => {
      let deps = [
         // No docker gens are listed
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      let cleanUp = () => {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/pipeline/index.js`))
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
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });

   it(`for azure should not compose with Docker`, () => {
      var deps = [
         // No docker gens are listed
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      return helpers.run(path.join(__dirname, `../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([`asp`, `aspDemo`, `http://localhost:8080/tfs/defaultcollection`,
            `default`, `paas`, `AzureSub`, `AzureSubId`, `TenantId`, `servicePrincipalId`,
            ``, ``, ``, ``, ``, ``,
            `servicePrincipalKey`, `token`
         ])
         .on(`error`, e => {
            assert.fail(e);
         });
   });

   it(`for docker should not compose with azure`, () => {
      var deps = [
         // No azure gens are listed
         [helpers.createDummyGenerator(), `team:build`],
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

      return helpers.run(path.join(__dirname, `../generators/pipeline/index.js`))
         .withGenerators(deps)
         .withArguments([type, applicationName, tfs,
            queue, target, azureSub, azureSubId, tenantId, servicePrincipalId,
            dockerHost, dockerCertPath, dockerRegistry, dockerRegistryId, dockerPorts,
            dockerRegistryPassword, servicePrincipalKey, pat
         ])
         .on(`error`, e => {
            assert.fail(e);
         });
   });
});