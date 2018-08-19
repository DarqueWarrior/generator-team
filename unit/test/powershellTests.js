const path = require(`path`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:powershell`, function () {
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
      assert.file([
         `./Trackyon.Git/.docs/common/description.md`,
         `./Trackyon.Git/.docs/common/header.md`,
         `./Trackyon.Git/.docs/synopsis/Show-GitRepo.md`,
         `./Trackyon.Git/.docs/about_Trackyon.Git.md`,
         `./Trackyon.Git/.docs/gen-help.ps1`,
         `./Trackyon.Git/.docs/Show-GitRepo.md`,
         `./Trackyon.Git/.docs/index.md`,
         `./Trackyon.Git/.docs/readme.md`,
         `./Trackyon.Git/Classes/Classes.ps1`,
         `./Trackyon.Git/Internal/Internal.ps1`,
         `./Trackyon.Git/Public/Show-GitRepo.ps1`,
         `./Trackyon.Git/Tests/Show-GitRepo.tests.ps1`,
         `./Trackyon.Git/.gitignore`,
         `./Trackyon.Git/readme.md`,
         `./Trackyon.Git/Trackyon.Git.psd1`,
         `./Trackyon.Git/Trackyon.Git.psm1`
      ]);
   });
   
   it(`psd1 file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Trackyon.Git.psd1`, `RootModule = 'Trackyon.Git.psm1'`);
      assert.fileContent(`Trackyon.Git/Trackyon.Git.psd1`, `FunctionsToExport = @('Show-GitRepo')`);
      assert.fileContent(`Trackyon.Git/Trackyon.Git.psd1`, `# .ExternalHelp Trackyon.Git-Help.xml`);
      assert.fileContent(`Trackyon.Git/Trackyon.Git.psd1`, `# Module manifest for module 'Trackyon.Git'`);
   });

   it(`header file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `external help file: Trackyon.Git-Help.xml`);
      assert.fileContent(`Trackyon.Git/.docs/common/header.md`, `Module Name: Trackyon.Git`);
   });

   it(`about.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/about_Trackyon.Git.md`, `# Trackyon.Git`);
      assert.fileContent(`Trackyon.Git/.docs/about_Trackyon.Git.md`, `## about_Trackyon.Git`);
   });

   it(`help file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `# Show-GitRepo`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `Show-GitRepo [<CommonParameters>]`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `<!-- #include "./Synopsis/Show-GitRepo.md" -->`);
   });

   it(`index.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/index.md`, `## Trackyon.Git Functions`);
   });

   it(`readme.md file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `# Trackyon.Git Help`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `[Trackyon.Git](../en-US/about_Trackyon.Git.help.txt)`);
      assert.fileContent(`Trackyon.Git/.docs/readme.md`, `Learn about the goals of Trackyon.Git`);
   });

   it(`test file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Tests/Show-GitRepo.tests.ps1`, `. "$PSScriptRoot\\..\\Public\\Show-GitRepo.ps1"`);
      assert.fileContent(`Trackyon.Git/Tests/Show-GitRepo.tests.ps1`, `Describe 'Show-GitRepo' {`);
      assert.fileContent(`Trackyon.Git/Tests/Show-GitRepo.tests.ps1`, `{ Show-GitRepo } | Should Not Throw`);
   });

   it(`function file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Public/Show-GitRepo.ps1`, `function Show-GitRepo {`);
   });
});