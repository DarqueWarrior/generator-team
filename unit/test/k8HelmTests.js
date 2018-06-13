const path = require(`path`);
const fs = require(`fs`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);
const proxyquire = require(`proxyquire`);
const sinonTestFactory = require(`sinon-test`);
const util = require(`../../generators/app/utility`);
const build = require(`../../generators/build/app`);
//const kubernetes = require(`../../generators/k8helmpipeline/app`);

const sinonTest = sinonTestFactory(sinon);

describe(`k8helmpipeline:index`, function(){
   var deps = [
      path.join(__dirname, `../../generators/azure`),
      path.join(__dirname, `../../generators/build`),
      path.join(__dirname, `../../generators/release`)
   ];

   it(`test prompts k8helmpipeline should not return error for acs`, function () {
      let expectedAccount = `http://localhost:8080/tfs/DefaultCollection`;
      let expectedToken = `OnRva2Vu`;
      let applicationName = 'kubeDemo';
      let cleanUp = function() {
         util.getPools.restore();
         util.findQueue.restore();
         util.findProject.restore();
         util.tryFindBuild.restore();
         util.tryFindRelease.restore();
         util.isTFSGreaterThan2017.restore();
         util.findBuild.restore();
      };

      return helpers.run(path.join(__dirname, `../../generators/k8helmpipeline`))
         .withGenerators(deps)
         .withPrompts({
            pat: `token`,
            type: 'kubernetes',
            applicationName: applicationName,
            target: `acs`,
            tfs: `http://localhost:8080/tfs/DefaultCollection`,
            queue: `Hosted Linux Preview`
         })
         .on(`error`, function (e) {
            cleanUp();
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            sinon.stub(util, `getPools`);
            sinon.stub(util, `findQueue`).callsArgWith(4, null, 1);
            sinon.stub(util, `isTFSGreaterThan2017`).callsArgWith(2, null, false);
            sinon.stub(util, `tryFindBuild`).callsArgWith(4, null, {
               value: "I`m a build."
            });
            sinon.stub(util, `findProject`).callsArgWith(4, null, {
               value: "TeamProject",
               id: 1
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
            sinon.stub(util, `findBuild`).callsFake(function (account, teamProject, token, target, callback) {
               assert.equal(expectedAccount, account, `findBuild - Account is wrong`);
               assert.equal(1, teamProject.id, `findBuild - team project is wrong`);
               assert.equal(expectedToken, token, `findBuild - token is wrong`);
               assert.equal(`acs`, target, `findBuild - target is wrong`);

               callback(null, {
                  value: "I`m a build.",
                  authoredBy: {
                     id: 1,
                     uniqueName: `uniqueName`,
                     displayName: `displayName`
                  }
               });
            });
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
