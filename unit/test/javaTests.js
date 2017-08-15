const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:java docker`, () => {
   var spawnStub;

   before(() => {
      return helpers.run(path.join(__dirname, `../../generators/java/index`))
         .withArguments([`javaUnitTest`, `docker`, `false`])
         .on(`error`, e => {
            assert.fail(e);
         })
         .on(`ready`, generator => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`bower install should not be called`, () => {
      assert.equal(0, spawnStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).callCount, `bower install was called`);
   });

   it(`files should be generated`, () => {
      assert.file([
         `javaUnitTest/pom.xml`,
         `javaUnitTest/.bowerrc`,
         `javaUnitTest/README.md`,
         `javaUnitTest/.gitignore`,
         `javaUnitTest/bower.json`,
         `javaUnitTest/Dockerfile`,
         `javaUnitTest/templates/website.json`,
         `javaUnitTest/templates/parameters.xml`,
         `javaUnitTest/templates/website.parameters.json`
      ]);

      assert.fileContent(`javaUnitTest/bower.json`, `"name": "javaunittest"`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaVersion": "1.8"`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaContainer": "TOMCAT"`);
      assert.fileContent(`javaUnitTest/templates/website.json`, `"javaContainerVersion": "8.0"`);
      assert.fileContent(`javaUnitTest/Dockerfile`, `ADD target/javaUnitTest.war /usr/local/tomcat/webapps/ROOT.war`);
   });
});

describe(`team:java paas`, () => {
   var bowerStub;

   before(() => {
      return helpers.run(path.join(__dirname, `../generators/java/index`))
         .withArguments([`javaUnitTest`, `testGroupID`, `true`, `80`])
         .on(`error`, e => {
            assert.fail(e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            bowerStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`bower install should be called`, () => {
      // Make sure the calls to install were made
      assert(bowerStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).calledOnce, `bower install not called once`);
   });

   it(`files should be generated`, () => {
      assert.file([
         `pom.xml`,
         `.bowerrc`,
         `README.md`,
         `.gitignore`,
         `bower.json`,
         `Dockerfile`,
         `templates/parameters.xml`,
         `templates/website.json`,
         `templates/website.parameters.json`,
         `templates/docker.json`,
         `templates/docker.parameters.json`,
         `templates/acilinux.json`,
         `templates/acilinux.parameters.json`
      ]);

      assert.fileContent(`bower.json`, `"name": "javaunittest"`);
      assert.fileContent(`templates/acilinux.parameters.json`, `"value": "80"`);
      assert.fileContent(`Dockerfile`, `ADD target/javaUnitTest.war /usr/local/tomcat/webapps/ROOT.war`);
   });
});