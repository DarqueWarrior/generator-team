const path = require(`path`);
const sinon = require(`sinon`);
const fs = require(`fs-extra`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:powershell gallery`, () => {
   var spawnStub;

   before(() => {
      return helpers.run(path.join(__dirname, `../generators/powershell/index`))
         .withArguments([`powershellDemo`, `PowerShell Demo Author`, `Does Awesome Things`])
         .on(`error`, (e) => {
            assert.fail(e);
         })
         .on(`ready`, (generator) => {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`files should be generated`, () => {
      assert.file([
         `powershellDemo/powershellDemo.psd1`,
         `powershellDemo/powershellDemo.psm1`,
         `powershellDemo/test/powershellDemo.Tests.ps1`,
         `powershellDemo/README.md`,
         `powershellDemo/.gitignore`,
         `powershellDemo/build.ps1`
      ]);

      assert.fileContent(`powershellDemo/powershellDemo.psd1`, `   RootModule        = 'powershellDemo.psm1'`);
      assert.fileContent(`powershellDemo/powershellDemo.psd1`, `   Author            = 'PowerShell Demo Author'`);
      assert.fileContent(`powershellDemo/powershellDemo.psd1`, `   Description       = 'Does Awesome Things'`);
      assert.fileContent(`powershellDemo/test/powershellDemo.Tests.ps1`, `$ModuleManifestName = 'powershellDemo'`);
   });

   it(`prompts for application, author, and description without type set`, () => {
      return helpers.run(path.join(__dirname, `../generators/powershell/index`))
         .withPrompts({
            applicationName: `powershellDemo`,
            powershellAuthor: `PowerShell Demo Author`,
            powershellDescription: `Does Awesome Things`,
         })
         .on(`error`, e => {
            assert.fail(e);
         });
   });
});