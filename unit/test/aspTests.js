const path = require(`path`);
const sinon = require(`sinon`);
const helpers = require(`yeoman-test`);
const assert = require(`yeoman-assert`);

describe(`team:asp docker`, function () {
   var spawnStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/asp`))
         .withArguments([`aspUnitTest`, `false`, `docker`, `tcp://23.1.1.1:2376`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            spawnStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`bower install should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).callCount, `bower install was called`);
   });

   it(`dotnet restore should not be called`, function () {
      assert.equal(0, spawnStub.withArgs(`dotnet`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).callCount, `dotnet restore was called`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `aspUnitTest/README.md`,
         `aspUnitTest/.gitignore`,
         `aspUnitTest/aspUnitTest.sln`,
         `aspUnitTest/src/aspUnitTest/aspUnitTest.csproj`,
         `aspUnitTest/src/aspUnitTest/.bowerrc`,
         `aspUnitTest/src/aspUnitTest/bower.json`,
         `aspUnitTest/src/aspUnitTest/web.config`,
         `aspUnitTest/src/aspUnitTest/Dockerfile`,
         `aspUnitTest/src/aspUnitTest/appsettings.json`,
         `aspUnitTest/src/aspUnitTest.Tests/aspUnitTest.Tests.csproj`
      ]);

      assert.fileContent(`aspUnitTest/src/aspUnitTest/bower.json`, `"name": "aspunittest"`);
      assert.fileContent(`aspUnitTest/src/aspUnitTest/Dockerfile`, `ENTRYPOINT dotnet aspUnitTest.dll`);
      assert.fileContent(`aspUnitTest/src/aspUnitTest/aspUnitTest.csproj`, `<TargetFramework>netcoreapp2.0</TargetFramework>`);
   });
});

describe(`team:asp paas`, function () {
   var bowerStub;

   before(function () {
      return helpers.run(path.join(__dirname, `../../generators/asp`))
         .withArguments([`aspUnitTest`, `true`, `80`])
         .on(`error`, function (e) {
            assert.fail(e);
         })
         .on(`ready`, function (generator) {
            // This is called right before `generator.run()` is called
            // Stub the calls to spawnCommandSync
            bowerStub = sinon.stub(generator, `spawnCommandSync`);
         });
   });

   it(`bower install should be called`, function () {
      // Make sure the calls to install were made
      assert(bowerStub.withArgs(`bower`, [`install`], { stdio: ['pipe', 'pipe', process.stderr] }).calledOnce, `bower install not called once`);
   });

   it(`dotnet restore should be called`, function () {
      // Make sure the calls to install were made
      assert(bowerStub.withArgs(`dotnet`, [`restore`], { stdio: ['pipe', 'pipe', process.stderr] }).calledOnce, `dotnet restore not called once`);
   });

   it(`files should be generated`, function () {
      assert.file([
         `README.md`,
         `aspUnitTest.sln`,
         `.gitignore`,
         `./src/aspUnitTest/.bowerrc`,
         `./src/aspUnitTest/appsettings.Development.json`,
         `./src/aspUnitTest/appsettings.json`,
         `./src/aspUnitTest/bower.json`,
         `./src/aspUnitTest/bundleconfig.json`,
         `./src/aspUnitTest/Dockerfile`,
         `./src/aspUnitTest/Program.cs`,
         `./src/aspUnitTest/Startup.cs`,
         `./src/aspUnitTest/Controllers/HomeController.cs`,
         `./src/aspUnitTest/Models/ErrorViewModel.cs`,
         `./src/aspUnitTest/aspUnitTest.csproj`,
         `./src/aspUnitTest.Tests/aspUnitTest.Tests.csproj`,
         `./src/aspUnitTest.Tests/HomeControllerTest.cs`,
         `./templates/acilinux.json`,
         `./templates/acilinux.parameters.json`,
         `./templates/docker.json`,
         `./templates/docker.parameters.json`,
         `./templates/parameters.xml`,
         `./templates/website.json`,
         `./templates/website.parameters.json`
      ]);

      assert.fileContent(`./templates/website.json`, `"name": "appsettings"`);
      assert.fileContent(`./templates/acilinux.parameters.json`, `"value": "80"`);
      assert.fileContent(`./src/aspUnitTest/bower.json`, `"name": "aspunittest"`);
      assert.fileContent(`./src/aspUnitTest/Dockerfile`, `ENTRYPOINT dotnet aspUnitTest.dll`);
      assert.fileContent(`./src/aspUnitTest/aspUnitTest.csproj`, `<TargetFramework>netcoreapp2.0</TargetFramework>`);
   });
});