const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:aspFull paas`, function () {
   var bowerStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/aspFull/index`))
         .withArguments([`aspFullUnitTest`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
         });
   });

   it(`files should be generated`, function () {
      assert.file([
         `./aspFullUnitTest/aspFullUnitTest.sln`,
         `./aspFullUnitTest/.gitattributes`,
         `./aspFullUnitTest/.gitignore`,
         `./aspFullUnitTest/aspFullUnitTest.IaC/WebSite.json`,
         `./aspFullUnitTest/aspFullUnitTest.IaC/WebSite.parameters.json`,
      ]);
   });
});