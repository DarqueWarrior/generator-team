const path = require('path');
const uuidV4 = require('uuid/v4');
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.applicationName(this);
   args.installDep(this);
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.applicationName(this),
      prompts.installDep(this)
   ]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.installDep = util.reconcileValue(a.installDep, cmdLnInput.installDep);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
   }.bind(this));
}

function writeFiles() {
   var tokens = {
      name: this.applicationName,
      name_lowercase: this.applicationName.toLowerCase(),
      appGuid: uuidV4(),
      testsGuid: uuidV4(),
      srcFolderGuid: uuidV4(),
      testFolderGuid: uuidV4()
   };

   var src = this.sourceRoot();
   var root = this.applicationName;

   // Root files
   this.copy(`${src}/README.md`, `${root}/README.md`);
   this.copy(`${src}/gitignore`, `${root}/.gitignore`);
   this.fs.copyTpl(`${src}/.bowerrc`, `${root}/.bowerrc`, tokens);
   this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
   this.fs.copyTpl(`${src}/app.sln`, `${root}/${this.applicationName}.sln`, tokens);

   // Web App project
   src = `${this.sourceRoot()}/src/app`;
   root = `${this.applicationName}/src/${this.applicationName}`;

   this.directory(`${src}/wwwroot`, `${root}/wwwroot`);
   this.directory(`${src}/Views/Home`, `${root}/Views/Home`);

   this.copy(`${src}/web.config`, `${root}/web.config`);
   this.copy(`${src}/appsettings.json`, `${root}/appsettings.json`);
   this.copy(`${src}/bundleconfig.json`, `${root}/bundleconfig.json`);
   this.copy(`${src}/Views/_ViewStart.cshtml`, `${root}/Views/_ViewStart.cshtml`);
   this.copy(`${src}/Views/Shared/Error.cshtml`, `${root}/Views/Shared/Error.cshtml`);

   this.fs.copyTpl(`${src}/Dockerfile`, `${root}/Dockerfile`, tokens);
   this.fs.copyTpl(`${src}/Program.cs`, `${root}/Program.cs`, tokens);
   this.fs.copyTpl(`${src}/Startup.cs`, `${root}/Startup.cs`, tokens);
   this.fs.copyTpl(`${src}/app.csproj`, `${root}/${this.applicationName}.csproj`, tokens);   
   this.fs.copyTpl(`${src}/Views/_ViewImports.cshtml`, `${root}/Views/_ViewImports.cshtml`, tokens);
   this.fs.copyTpl(`${src}/Views/Shared/_Layout.cshtml`, `${root}/Views/Shared/_Layout.cshtml`, tokens);
   this.fs.copyTpl(`${src}/Controllers/HomeController.cs`, `${root}/Controllers/HomeController.cs`, tokens);
   this.fs.copyTpl(`${src}/Properties/launchSettings.json`, `${root}/Properties/launchSettings.json`, tokens);

   // Now test project
   src = `${this.sourceRoot()}/test/app.tests`;
   root = `${this.applicationName}/test/${this.applicationName}.Tests`;

   this.fs.copyTpl(`${src}/app.Tests.csproj`, `${root}/${this.applicationName}.Tests.csproj`, tokens);
   this.fs.copyTpl(`${src}/HomeControllerTest.cs`, `${root}/HomeControllerTest.cs`, tokens);

   // ARM Templates
   src = `${this.sourceRoot()}/templates`;
   root = `${this.applicationName}/templates`;

   this.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);

   this.copy(`${src}/asp_arm.json`, `${root}/website.json`);
   this.copy(`${src}/arm.parameters.json`, `${root}/website.parameters.json`);

   this.copy(`${src}/docker_arm.json`, `${root}/docker.json`);
   this.copy(`${src}/docker_arm.parameters.json`, `${root}/docker.parameters.json`);
}

function install() {
   if (this.installDep === 'true') {
      process.chdir(`${this.applicationName}`);

      this.log(`+ Running bower install`);
      // I don't want to see the output of this command
      this.spawnCommandSync('bower', ['install'], {
         stdio: ['pipe', 'pipe', process.stderr]
      });

      this.log(`+ Running dotnet restore`);
      this.spawnCommandSync('dotnet', ['restore'], {
         stdio: ['pipe', 'pipe', process.stderr]
      });
   }
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: writeFiles,

   // 7. Where installation are run (npm, bower)
   install: install
});