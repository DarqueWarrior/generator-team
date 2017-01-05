const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const util = require(`../generators/app/utility`);

describe(`app:index`, () => {
   it(`arguments using fake dependencies paas`, () => {
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      return helpers.run(path.join(__dirname, `../generators/app/index`))
         .withGenerators(deps)
         .withArguments([`asp`, `aspDemo`, `vsts`,
            `AzureSub`, `AzureSubId`, `TenantId`, `servicePrincipalId`,
            `default`, `paas`,
            `false`, ``,
            ``, ``, ``, ``, ``, ``,
            `servicePrincipalKey`, `token`])
         .on(`error`, e => {
            assert.fail(e);
         });
   });

   it(`prompts using fake dependencies paas`, () => {
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:azure`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`]
      ];

      var cleanUp = () => {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/app/index`))
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

   it(`arguments using fake dependencies docker`, () => {
      let deps = [
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:node`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:docker`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`]
      ];

      return helpers.run(path.join(__dirname, `../generators/app/index`))
         .withGenerators(deps)
         .withArguments([`node`, `demo`, `vsts`,
            ``, ``, ``, ``, `default`, `docker`,
            `false`, ``,
            `dockerHost`, `dockerCertPath`, `dockerRegistryId`, `dockerRegistryEmail`, `dockerPorts`, `dockerRegistryPassword`,
            `servicePrincipalKey`, `token`])
         .on(`error`, e => {
            assert.fail(e);
         });
   });

   it(`prompts using fake dependencies docker`, () => {
      let deps = [
         [helpers.createDummyGenerator(), `team:asp`],
         [helpers.createDummyGenerator(), `team:git`],
         [helpers.createDummyGenerator(), `team:java`],
         [helpers.createDummyGenerator(), `team:build`],
         [helpers.createDummyGenerator(), `team:docker`],
         [helpers.createDummyGenerator(), `team:project`],
         [helpers.createDummyGenerator(), `team:release`],
         [helpers.createDummyGenerator(), `team:registry`]
      ];

      var cleanUp = () => {
         util.getPools.restore();
         util.getAzureSubs.restore();
      };

      return helpers.run(path.join(__dirname, `../generators/app/index`))
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
            dockerRegistryId: `dockerRegistryId`,
            dockerRegistryEmail: `dockerRegistryEmail`,
            dockerRegistryPassword: `dockerRegistryPassword`
         })
         .on(`error`, e => {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, generato => {
            // This is called right before `generator.run()` is called.
            sinon.stub(util, `getPools`);
            sinon.stub(util, `getAzureSubs`);
         })
         .on(`end`, e => {
            cleanUp();
         });
   });
});