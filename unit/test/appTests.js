const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../../generators/app/utility`);

describe(`app:index`, function () {
   it(`arguments using fake dependencies dockerpaas linux`, function () {
      // Arrange
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      let type = `asp`;
      let name = `aspDemo`;
      let tfs = `vsts`;
      let azureSub = `AzureSub`;
      let azureSubId = `AzureSubId`;
      let tenantId = `TenantId`;
      let servicePrincipalId = `servicePrincipalId`;
      let queue = `Hosted Linux Preview`;
      let target = `dockerpaas`;
      let installDep = `false`;
      let groupId = ``;
      let dockerHost = ``;
      let dockerCertPath = ``;
      let dockerRegistry = `dockerRegistry`;
      let dockerRegistryId = `dockerRegistryId`;
      let dockerPorts = `dockerPorts`;
      let dockerRegistryPassword = `dockerRegistryPassword`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let pat = `token`;

      // Act
      return helpers.run(path.join(__dirname, `../../generators/app`))
         .withGenerators(deps)
         .withArguments([type, name, tfs,
            azureSub, azureSubId, tenantId, servicePrincipalId,
            queue, target, installDep, groupId,
            dockerHost, dockerCertPath,
            dockerRegistry, dockerRegistryId, dockerPorts, dockerRegistryPassword,
            servicePrincipalKey, pat
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });

   it(`arguments using fake dependencies paas`, function () {
      // Arrange
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      let type = `asp`;
      let name = `aspDemo`;
      let tfs = `vsts`;
      let azureSub = `AzureSub`;
      let azureSubId = `AzureSubId`;
      let tenantId = `TenantId`;
      let servicePrincipalId = `servicePrincipalId`;
      let queue = `default`;
      let target = `paas`;
      let installDep = `false`;
      let groupId = ``;
      let dockerHost = ``;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let dockerRegistryId = ``;
      let dockerPorts = ``;
      let dockerRegistryPassword = ``;
      let servicePrincipalKey = `servicePrincipalKey`;
      let pat = `token`;

      // Act
      return helpers.run(path.join(__dirname, `../../generators/app`))
         .withGenerators(deps)
         .withArguments([type, name, tfs,
            azureSub, azureSubId, tenantId, servicePrincipalId,
            queue, target, installDep, groupId,
            dockerHost, dockerCertPath,
            dockerRegistry, dockerRegistryId, dockerPorts, dockerRegistryPassword,
            servicePrincipalKey, pat
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });

   it(`arguments using fake dependencies aspFull paas`, function () {
      // Arrange
      let deps = [
         [helpers.createDummyGenerator(), `team:aspFull`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      let type = `aspFull`;
      let name = `aspDemo`;
      let tfs = `vsts`;
      let azureSub = `AzureSub`;
      let azureSubId = `AzureSubId`;
      let tenantId = `TenantId`;
      let servicePrincipalId = `servicePrincipalId`;
      let queue = `default`;
      let target = `paas`;
      let installDep = `false`;
      let groupId = ``;
      let dockerHost = ``;
      let dockerCertPath = ``;
      let dockerRegistry = ``;
      let dockerRegistryId = ``;
      let dockerPorts = ``;
      let dockerRegistryPassword = ``;
      let servicePrincipalKey = `servicePrincipalKey`;
      let pat = `token`;

      // Act
      return helpers.run(path.join(__dirname, `../../generators/app`))
         .withGenerators(deps)
         .withArguments([type, name, tfs,
            azureSub, azureSubId, tenantId, servicePrincipalId,
            queue, target, installDep, groupId,
            dockerHost, dockerCertPath,
            dockerRegistry, dockerRegistryId, dockerPorts, dockerRegistryPassword,
            servicePrincipalKey, pat
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });

   it(`prompts using fake dependencies paas`, function () {
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      var cleanUp = function () {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/app`))
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

   it(`arguments using fake dependencies docker`, function () {
      // Arrange
      let deps = [
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:node`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:docker`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      let type = `node`;
      let name = `demo`;
      let tfs = `vsts`;
      let azureSub = ``;
      let azureSubId = ``;
      let tenantId = ``;
      let servicePrincipalId = ``;
      let queue = `default`;
      let target = `docker`;
      let installDep = `false`;
      let groupId = ``;
      let dockerHost = `dockerHost`;
      let dockerCertPath = `dockerCertPath`;
      let dockerRegistry = `dockerRegistry`;
      let dockerRegistryId = `dockerRegistryId`;
      let dockerPorts = `dockerPorts`;
      let dockerRegistryPassword = `dockerRegistryPassword`;
      let servicePrincipalKey = `servicePrincipalKey`;
      let pat = `token`;

      return helpers.run(path.join(__dirname, `../../generators/app`))
         .withGenerators(deps)
         .withArguments([type, name, tfs,
            azureSub, azureSubId, tenantId, servicePrincipalId,
            queue, target, installDep, groupId,
            dockerHost, dockerCertPath,
            dockerRegistry, dockerRegistryId, dockerPorts, dockerRegistryPassword,
            servicePrincipalKey, pat
         ])
         .on(`error`, function (e) {
            assert.fail(e);
         });
   });

   it(`prompts using fake dependencies docker`, function () {
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:feed`],
         [helpers.createDummyGenerator(), `team:java`],
         [helpers.createDummyGenerator(), `team:nuget`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:docker`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`],
         [helpers.createDummyGenerator(), `team:powershell`]
      ];

      var cleanUp = function () {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/app`))
         .withGenerators(deps)
         .withPrompts({
            tfs: `vsts`,
            type: `java`,
            pat: `token`,
            groupId: `demo`,
            queue: `Default`,
            target: `docker`,
            installDep: `false`,
            dockerHost: `dockerHost`,
            dockerPorts: `dockerPorts`,
            applicationName: `javaDemo`,
            dockerCertPath: `dockerCertPath`,
            dockerRegistry: `dockerRegistry`,
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryPassword: `dockerRegistryPassword`
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
});