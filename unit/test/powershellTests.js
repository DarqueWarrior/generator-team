const path = require(`path`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

function verifyFiles() {
   assert.file([
      `./Trackyon.Git/.docs/common/description.md`,
      `./Trackyon.Git/.docs/common/header.md`,
      `./Trackyon.Git/.docs/gen-help.ps1`,
      `./Trackyon.Git/.docs/index.md`,
      `./Trackyon.Git/.docs/readme.md`,
      `./Trackyon.Git/Source/Classes/_classes.json`,
      `./Trackyon.Git/Source/formats/_formats.json`,
      `./Trackyon.Git/Source/Private/common.ps1`,
      `./Trackyon.Git/Source/types/_types.json`,
      `./Trackyon.Git/Source/_functions.json`,
      `./Trackyon.Git/Source/Trackyon.Git.psd1`,
      `./Trackyon.Git/Source/Trackyon.Git.psm1`,
      `./Trackyon.Git/Source/en-US/about_Trackyon.Git.help.txt`,
      `./Trackyon.Git/.gitignore`,
      `./Trackyon.Git/readme.md`,
      `./Trackyon.Git/Build-Module.ps1`,
      `./Trackyon.Git/Merge-File.ps1`
   ]);
}

function verifyPsd1Content() {
   assert.fileContent(`Trackyon.Git/Source/Trackyon.Git.psd1`, `RootModule        = 'Trackyon.Git.psm1'`);
   assert.fileContent(`Trackyon.Git/Source/Trackyon.Git.psd1`, `# .ExternalHelp Trackyon.Git-Help.xml`);
   assert.fileContent(`Trackyon.Git/Source/Trackyon.Git.psd1`, `# Module manifest for module 'Trackyon.Git'`);
}

describe(`team:powershell with prompts`, function () {
   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/powershell`))
         .withPrompts({
            applicationName: `Trackyon.Git`,
            functionName: `Show-GitRepo`
         })
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
         });
   });

   it(`files should be generated`, function () {
      verifyFiles();
   });

   it(`psd1 file should have correct content`, function () {
      verifyPsd1Content()
   });

   it(`header file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `external help file: Trackyon.Git-Help.xml`);
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `Module Name: Trackyon.Git`);
   });

   it(`index.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/index.md`, `## Trackyon.Git Functions`);
   });

   it(`readme.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `# Trackyon.Git Help`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `[Trackyon.Git](../en-US/about_Trackyon.Git.help.txt)`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `Learn about the goals of Trackyon.Git`);
   });

   it(`build-module.ps1 file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Build-Module.ps1`, `Trackyon.Git`);
   });
});

describe(`team:powershell with arguments`, function () {
   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/powershell`))
         .withArguments([`Trackyon.Git`, `Show-GitRepo`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
         });
   });

   it(`files should be generated`, function () {
      verifyFiles();
   });

   it(`psd1 file should have correct content`, function () {
      verifyPsd1Content();
   });

   it(`header file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `external help file: Trackyon.Git-Help.xml`);
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `Module Name: Trackyon.Git`);
   });

   it(`index.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/index.md`, `## Trackyon.Git Functions`);
   });

   it(`readme.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `# Trackyon.Git Help`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `[Trackyon.Git](../en-US/about_Trackyon.Git.help.txt)`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `Learn about the goals of Trackyon.Git`);
   });
});