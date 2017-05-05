const fs = require(`fs`);
const path = require(`path`);
const sinon = require(`sinon`);
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
         util.findDockerServiceEndpoint.restore();
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`nodeDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Hosted Linux Preview`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`dockerpaas`, target, `findBuild - target is wrong`);

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
               assert.equal(`dockerpaas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findAzureServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - token is wrong`);
               assert.equal(`azureSub`, sub.name, `findAzureServiceEndpoint - sub is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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
         util.findDockerServiceEndpoint.restore();
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`nodeDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Hosted Linux Preview`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`dockerpaas`, target, `findBuild - target is wrong`);

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
               assert.equal(`dockerpaas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findAzureServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - token is wrong`);
               assert.equal(`azureSub`, sub.name, `findAzureServiceEndpoint - sub is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`nodeDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`docker`, target, `findBuild - target is wrong`);

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
               assert.equal(`docker`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`nodeDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`docker`, target, `findBuild - target is wrong`);

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
               assert.equal(`docker`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`nodeDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
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

            sinon.stub(util, `tryFindRelease`).callsFake((args, callback) => {
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - token is wrong`);
               assert.equal(`paas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findAzureServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - token is wrong`);
               assert.equal(`azureSub`, sub.name, `findAzureServiceEndpoint - sub is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`javaDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`docker`, target, `findBuild - target is wrong`);

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
               assert.equal(`docker`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
         })
         .on(`end`, (e) => {
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`javaDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
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

            sinon.stub(util, `tryFindRelease`).callsFake((args, callback) => {
               assert.equal(expectedAccount, args.account, `tryFindRelease - Account is wrong`);
               assert.equal(1, args.teamProject.id, `tryFindRelease - team project is wrong`);
               assert.equal(expectedToken, args.token, `tryFindRelease - token is wrong`);
               assert.equal(`paas`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findAzureServiceEndpoint`).callsFake((account, projectId, sub, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findAzureServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findAzureServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findAzureServiceEndpoint - token is wrong`);
               assert.equal(`azureSub`, sub.name, `findAzureServiceEndpoint - sub is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
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

            sinon.stub(util, `findProject`).callsFake((tfs, project, token, gen, callback) => {
               assert.equal(expectedAccount, tfs, `findProject - TFS is wrong`);
               assert.equal(`aspDemo`, project, `findProject - Project is wrong`);
               assert.equal(expectedToken, token, `findProject - Token is wrong`);

               callback(null, {
                  value: "TeamProject",
                  id: 1
               });
            });

            sinon.stub(util, `findQueue`).callsFake((name, account, teamProject, token, callback) => {
               assert.equal(`Default`, name, `findQueue - name is wrong`);
               assert.equal(expectedAccount, account, `findQueue - Account is wrong`);
               assert.equal(1, teamProject.id, `findQueue - team project is wrong`);
               assert.equal(expectedToken, token, `findQueue - token is wrong`);

               callback(null, 1);
            });

            sinon.stub(util, `findBuild`).callsFake((account, teamProject, token, target, callback) => {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`docker`, target, `findBuild - target is wrong`);

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
               assert.equal(`docker`, args.target, `tryFindRelease - target is wrong`);

               callback(null, {
                  value: "I`m a release."
               });
            });

            sinon.stub(util, `findDockerServiceEndpoint`).callsFake((account, projectId, dockerHost, token, gen, callback) => {
               assert.equal(expectedAccount, account, `findDockerServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });

            sinon.stub(util, `findDockerRegistryServiceEndpoint`).callsFake((account, projectId, dockerRegistry, token, callback) => {
               assert.equal(expectedAccount, account, `findDockerRegistryServiceEndpoint - Account is wrong`);
               assert.equal(1, projectId, `findDockerRegistryServiceEndpoint - team project is wrong`);
               assert.equal(expectedToken, token, `findDockerRegistryServiceEndpoint - token is wrong`);

               callback(null, {
                  name: `endpoint`,
                  id: 1
               });
            });
         })
         .on(`end`, e => {
            cleanUp();
         });
   });
});

describe(`release:app`, () => {
   "use strict";

   it(`run with existing release should run without error`, sinon.test(function (done) {
      // Arrange
      // callsArgWith uses the first argument as the index of the callback function
      // to call and calls it with the rest of the arguments provided.
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `findDockerRegistryServiceEndpoint`).callsArgWith(4, null, null);
      this.stub(util, `tryFindRelease`).callsArgWith(1, null, {
         value: "I`m a release."
      });
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
      this.stub(util, `findQueue`).callsArgWith(4, null, 1);
      this.stub(util, `findDockerServiceEndpoint`).callsArgWith(5, null, null);
      this.stub(util, `tryFindRelease`).callsArgWith(1, new Error("boom"), null);
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
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, null);

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

   it(`findOrCreateRelease should create release docker vsts`, sinon.test(function (done) {
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
      this.stub(util, `findAzureServiceEndpoint`).callsArgWith(5, null, null);

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