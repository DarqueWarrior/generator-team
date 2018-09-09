const uuidV4 = require('uuid/v4');
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
      argUtils.installDep(this);
      argUtils.dockerPorts(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this),
         prompts.installDep(this),
         prompts.dockerPorts(this)
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.installDep = util.reconcileValue(cmdLnInput.options.installDep, answers.installDep);
         this.dockerPorts = util.reconcileValue(cmdLnInput.options.dockerPorts, answers.dockerPorts, ``);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      var tokens = {
         name: this.applicationName,
         port: this.dockerPorts.split(':')[0],
         name_lowercase: this.applicationName.toLowerCase(),
         appGuid: uuidV4(),
         testsGuid: uuidV4(),
         srcFolderGuid: uuidV4(),
         testFolderGuid: uuidV4(),
         webtest_guid: uuidV4()
      };

      var src = this.sourceRoot();
      var root = this.applicationName;

      // Root files
      this.fs.copy(`${src}/README.md`, `${root}/README.md`);
      this.fs.copy(`${src}/gitignore`, `${root}/.gitignore`);
      this.fs.copyTpl(`${src}/app.sln`, `${root}/${this.applicationName}.sln`, tokens);

      // Web App project
      src = `${this.sourceRoot()}/src/app`;
      root = `${this.applicationName}/src/${this.applicationName}`;

      this.fs.copy(`${src}/wwwroot`, `${root}/wwwroot`);
      this.fs.copy(`${src}/Views/Home`, `${root}/Views/Home`);

      this.fs.copy(`${src}/web.config`, `${root}/web.config`);
      this.fs.copyTpl(`${src}/.bowerrc`, `${root}/.bowerrc`, tokens);
      this.fs.copy(`${src}/appsettings.json`, `${root}/appsettings.json`);
      this.fs.copyTpl(`${src}/bower.json`, `${root}/bower.json`, tokens);
      this.fs.copy(`${src}/bundleconfig.json`, `${root}/bundleconfig.json`);
      this.fs.copy(`${src}/Views/_ViewStart.cshtml`, `${root}/Views/_ViewStart.cshtml`);
      this.fs.copy(`${src}/Views/Shared/_ValidationScriptsPartial.cshtml`, `${root}/Views/Shared/_ValidationScriptsPartial.cshtml`);
      this.fs.copy(`${src}/Views/Shared/Error.cshtml`, `${root}/Views/Shared/Error.cshtml`);
      this.fs.copy(`${src}/appsettings.Development.json`, `${root}/appsettings.Development.json`);

      this.fs.copyTpl(`${src}/Dockerfile`, `${root}/Dockerfile`, tokens);
      this.fs.copyTpl(`${src}/Program.cs`, `${root}/Program.cs`, tokens);
      this.fs.copyTpl(`${src}/Startup.cs`, `${root}/Startup.cs`, tokens);
      this.fs.copyTpl(`${src}/app.csproj`, `${root}/${this.applicationName}.csproj`, tokens);
      this.fs.copyTpl(`${src}/Models/ErrorViewModel.cs`, `${root}/Models/ErrorViewModel.cs`, tokens);
      this.fs.copyTpl(`${src}/Views/_ViewImports.cshtml`, `${root}/Views/_ViewImports.cshtml`, tokens);
      this.fs.copyTpl(`${src}/Views/Shared/_Layout.cshtml`, `${root}/Views/Shared/_Layout.cshtml`, tokens);
      this.fs.copyTpl(`${src}/Controllers/HomeController.cs`, `${root}/Controllers/HomeController.cs`, tokens);

      // Now test project
      src = `${this.sourceRoot()}/src/app.tests`;
      root = `${this.applicationName}/src/${this.applicationName}.Tests`;

      this.fs.copyTpl(`${src}/app.Tests.csproj`, `${root}/${this.applicationName}.Tests.csproj`, tokens);
      this.fs.copyTpl(`${src}/HomeControllerTest.cs`, `${root}/HomeControllerTest.cs`, tokens);

      // ARM Templates
      src = `${this.sourceRoot()}/templates`;
      root = `${this.applicationName}/templates`;

      this.fs.copy(`${src}/parameters.xml`, `${root}/parameters.xml`);

      this.fs.copyTpl(`${src}/asp_arm.json`, `${root}/website.json`, tokens);
      this.fs.copy(`${src}/arm.parameters.json`, `${root}/website.parameters.json`);

      this.fs.copy(`${src}/acilinux_arm.json`, `${root}/acilinux.json`);
      this.fs.copyTpl(`${src}/acilinux_arm.parameters.json`, `${root}/acilinux.parameters.json`, tokens);

      this.fs.copyTpl(`${src}/docker_arm.json`, `${root}/docker.json`, tokens);
      this.fs.copy(`${src}/docker_arm.parameters.json`, `${root}/docker.parameters.json`);
   }

   // 7. Where installation are run (npm, bower)
   install() {
      if (this.installDep === 'true') {
         process.chdir(`${this.applicationName}`);

         this.log.ok(`Running bower install`);
         // I don't want to see the output of this command
         this.spawnCommandSync('bower', ['install'], {
            stdio: ['pipe', 'pipe', process.stderr]
         });

         this.log.ok(`Running dotnet restore`);
         this.spawnCommandSync('dotnet', ['restore'], {
            stdio: ['pipe', 'pipe', process.stderr]
         });
      }
   }
};