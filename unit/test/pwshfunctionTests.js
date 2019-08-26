const path = require(`path`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

function verifyFiles() {
   assert.file([
      `./Trackyon.Git/.docs/synopsis/Show-GitRepo.md`,
      `./Trackyon.Git/.docs/Show-GitRepo.md`,
      `./Trackyon.Git/Source/Public/Show-GitRepo.ps1`,
      `./Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`,
   ]);
}

describe(`team:pwshfunction with prompts`, function () {
   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/pwshfunction`))
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

   it(`help file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `# Show-GitRepo`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `Show-GitRepo [<CommonParameters>]`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `<!-- #include "./Synopsis/Show-GitRepo.md" -->`);
   });

   it(`test file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `. "$PSScriptRoot\\..\\Public\\Show-GitRepo.ps1"`);
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `Describe 'Show-GitRepo' {`);
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `{ Show-GitRepo } | Should Not Throw`);
   });

   it(`function file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Source/Public/Show-GitRepo.ps1`, `function Show-GitRepo {`);
   });
});

describe(`team:pwshfunction with arguments`, function () {
   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/pwshfunction`))
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

   it(`help file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `# Show-GitRepo`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `Show-GitRepo [<CommonParameters>]`);
      assert.fileContent(`Trackyon.Git/.docs/Show-GitRepo.md`, `<!-- #include "./Synopsis/Show-GitRepo.md" -->`);
   });

   it(`test file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `. "$PSScriptRoot\\..\\Public\\Show-GitRepo.ps1"`);
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `Describe 'Show-GitRepo' {`);
      assert.fileContent(`Trackyon.Git/unit/test/Show-GitRepo.tests.ps1`, `{ Show-GitRepo } | Should Not Throw`);
   });

   it(`function file should have correct content`, function () {
      assert.fileContent(`Trackyon.Git/Source/Public/Show-GitRepo.ps1`, `function Show-GitRepo {`);
   });
});