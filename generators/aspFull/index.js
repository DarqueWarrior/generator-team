const mkdirp = require('mkdirp');
const uuidV4 = require('uuid/v4');
const argUtils = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this)
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {

      var tokens = {
         name: this.applicationName,
         uuid1: uuidV4(),
         uuid2: uuidV4(),
         uuid3: uuidV4(),
         name_lowercase: this.applicationName.toLowerCase(),
         webtest_guid: uuidV4()
      };

      var src = this.sourceRoot();
      var root = this.applicationName;

      // Root files
      this.fs.copy(`${src}/gitignore`, `${root}/.gitignore`);
      this.fs.copy(`${src}/gitattributes`, `${root}/.gitattributes`);
      this.fs.copyTpl(`${src}/webapp.sln`, `${root}/${this.applicationName}.sln`, tokens);

      // Web App project
      src = `${this.sourceRoot()}/webapp`;
      root = `${this.applicationName}/${this.applicationName}`;

      // empty folders
      mkdirp.sync(`${root}/App_Data/`);
      mkdirp.sync(`${root}/Models/`);

      this.fs.copyTpl(`${src}/App_Start/BundleConfig.cs`, `${root}/App_Start/BundleConfig.cs`, tokens);
      this.fs.copyTpl(`${src}/App_Start/FilterConfig.cs`, `${root}/App_Start/FilterConfig.cs`, tokens);
      this.fs.copyTpl(`${src}/App_Start/RouteConfig.cs`, `${root}/App_Start/RouteConfig.cs`, tokens);

      this.fs.copyTpl(`${src}/Properties/AssemblyInfo.cs`, `${root}/Properties/AssemblyInfo.cs`, tokens);

      this.fs.copy(`${src}/Content`, `${root}/Content`);
      this.fs.copy(`${src}/fonts`, `${root}/fonts`);
      this.fs.copy(`${src}/Scripts`, `${root}/Scripts`);
      this.fs.copy(`${src}/Views/Home`, `${root}/Views/Home`);
      this.fs.copy(`${src}/Views/Shared`, `${root}/Views/Shared`);
      this.fs.copyTpl(`${src}/Views/Web.config`, `${root}/Views/Web.config`, tokens);

      this.fs.copy(`${src}/Views/_ViewStart.cshtml`, `${root}/Views/_ViewStart.cshtml`);
      this.fs.copyTpl(`${src}/Controllers/HomeController.cs`, `${root}/Controllers/HomeController.cs`, tokens);

      this.fs.copy(`${src}/ApplicationInsights.config`, `${root}/ApplicationInsights.config`);
      this.fs.copy(`${src}/favicon.ico`, `${root}/favicon.ico`);
      this.fs.copyTpl(`${src}/Global.asax`, `${root}/Global.asax`, tokens);
      this.fs.copyTpl(`${src}/Global.asax.cs`, `${root}/Global.asax.cs`, tokens);
      this.fs.copy(`${src}/packages.config`, `${root}/packages.config`);
      this.fs.copy(`${src}/Web.config`, `${root}/web.config`);
      this.fs.copy(`${src}/Web.Debug.config`, `${root}/web.Debug.config`);
      this.fs.copy(`${src}/Web.Release.config`, `${root}/web.Release.config`);

      this.fs.copyTpl(`${src}/webapp.csproj`, `${root}/${this.applicationName}.csproj`, tokens);

      // Now IaC project
      src = `${this.sourceRoot()}/webapp.IaC`;
      root = `${this.applicationName}/${this.applicationName}.IaC`;

      this.fs.copyTpl(`${src}/Deploy-AzureResourceGroup.ps1`, `${root}/Deploy-AzureResourceGroup.ps1`, tokens);
      this.fs.copyTpl(`${src}/webapp.IaC.deployproj`, `${root}/${this.applicationName}.IaC.deployproj`, tokens);
      this.fs.copyTpl(`${src}/WebSite.json`, `${root}/WebSite.json`, tokens);
      this.fs.copy(`${src}/Deployment.targets`, `${root}/Deployment.targets`);
      this.fs.copy(`${src}/WebSite.parameters.json`, `${root}/WebSite.parameters.json`);

      // Now test project
      src = `${this.sourceRoot()}/webapp.Tests`;
      root = `${this.applicationName}/${this.applicationName}.Tests`;

      this.fs.copy(`${src}/App.config`, `${root}/App.config`);
      this.fs.copy(`${src}/packages.config`, `${root}/packages.config`);

      this.fs.copyTpl(`${src}/Controllers/HomeControllerTest.cs`, `${root}/Controllers/HomeControllerTest.cs`, tokens);
      this.fs.copyTpl(`${src}/Properties/AssemblyInfo.cs`, `${root}/Properties/AssemblyInfo.cs`, tokens);
      this.fs.copyTpl(`${src}/webapp.Tests.csproj`, `${root}/${this.applicationName}.Tests.csproj`, tokens);
   }
};