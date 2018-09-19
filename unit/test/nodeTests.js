const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:node docker`, function () {
   var spawnStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/node`))
         .withArguments([`nodeDemo`, `false`, `80`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`yarn install should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`yarn`, [`install`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `yarn install was called`);
   });

   it(`npm install should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`npm`, [`install`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `npm install was called`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `nodeDemo/README.md`,
         `nodeDemo/.gitignore`,
         `nodeDemo/src/app.js`,
         `nodeDemo/package.json`,
         `nodeDemo/src/web.config`,
         `nodeDemo/src/utility.js`,
         `nodeDemo/src/Dockerfile`,
         `nodeDemo/src/package.json`,
         `nodeDemo/src/parameters.xml`,
         `nodeDemo/templates/docker.json`,
         `nodeDemo/templates/docker.parameters.json`,
         `nodeDemo/templates/website.json`,
         `nodeDemo/templates/website.parameters.json`,
         `nodeDemo/templates/acilinux.json`,
         `nodeDemo/templates/acilinux.parameters.json`
      ]);

      assert.fileContent(`nodeDemo/package.json`, `"name": "nodedemo"`);
      assert.fileContent(`nodeDemo/src/package.json`, `"name": "nodedemo"`);
      assert.fileContent(`nodeDemo/templates/website.json`, `"name": "appsettings"`);
      assert.noFileContent(`nodeDemo/templates/website.json`, `"javaVersion": "1.8"`);
      assert.noFileContent(`nodeDemo/templates/website.json`, `"javaContainer": "TOMCAT"`);
      assert.noFileContent(`nodeDemo/templates/website.json`, `"javaContainerVersion": "8.0"`);
      assert.fileContent(`nodeDemo/src/server.js`, "var debug = require('debug')('nodeDemo:server');");
   });
});

describe(`team:node paas`, function () {
   var yarnStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/node/index.js`))
         .withArguments([`nodeDemo`, `true`, `80`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            yarnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`yarn install should be called`, function () {
      // Make sure the calls to install were made
      assert(yarnStub.withArgs(`yarn`, [], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).calledOnce, `yarn install not called once`);
   });

   it(`npm install should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`npm`, [`install`], {
         stdio: ['pipe', 'pipe', process.stderr]
      }).callCount, `npm install was called`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `README.md`,
         `.gitignore`,
         `src/app.js`,
         `package.json`,
         `src/web.config`,
         `src/Dockerfile`,
         `src/package.json`,
         `templates/website.json`,
         `templates/website.parameters.json`,
         `templates/docker.json`,
         `templates/docker.parameters.json`,
         `templates/acilinux.json`,
         `templates/acilinux.parameters.json`
      ]);

      assert.fileContent(`package.json`, `"name": "nodedemo"`);
      assert.fileContent(`src/package.json`, `"name": "nodedemo"`);
      assert.fileContent(`templates/acilinux.parameters.json`, `"value": "80"`);
      assert.fileContent(`src/server.js`, "var debug = require('debug')('nodeDemo:server');");
   });
});