const path = require('path');
const mkdirp = require('mkdirp');
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
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.applicationName(this)
   ]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.applicationName = util.reconcileValue(cmdLnInput.applicationName, answers.applicationName);
   }.bind(this));
}

function writeFiles() {

   var tokens = {
      name: this.applicationName,
      uuid1: uuidV4(),
      uuid2: uuidV4(),
      uuid3: uuidV4(),
      name_lowercase: this.applicationName.toLowerCase()
   };

   var src = this.sourceRoot();
   var root = this.applicationName;

   // Root files
   this.copy(`${src}/gitignore`, `${root}/.gitignore`);
   this.copy(`${src}/gitattributes`, `${root}/.gitattributes`);
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

   this.directory(`${src}/Content`, `${root}/Content`);
   this.directory(`${src}/fonts`, `${root}/fonts`);
   this.directory(`${src}/Scripts`, `${root}/Scripts`);
   this.directory(`${src}/Views/Home`, `${root}/Views/Home`);
   this.directory(`${src}/Views/Shared`, `${root}/Views/Shared`);
   this.fs.copyTpl(`${src}/Views/Web.config`, `${root}/Views/Web.config`, tokens);

   this.copy(`${src}/Views/_ViewStart.cshtml`, `${root}/Views/_ViewStart.cshtml`);
   this.fs.copyTpl(`${src}/Controllers/HomeController.cs`, `${root}/Controllers/HomeController.cs`, tokens);

   this.copy(`${src}/ApplicationInsights.config`, `${root}/ApplicationInsights.config`);
   this.copy(`${src}/favicon.ico`, `${root}/favicon.ico`);
   this.fs.copyTpl(`${src}/Global.asax`, `${root}/Global.asax`, tokens);
   this.fs.copyTpl(`${src}/Global.asax.cs`, `${root}/Global.asax.cs`, tokens);
   this.copy(`${src}/packages.config`, `${root}/packages.config`);
   this.copy(`${src}/web.config`, `${root}/web.config`);
   this.copy(`${src}/web.Debug.config`, `${root}/web.Debug.config`);
   this.copy(`${src}/web.Release.config`, `${root}/web.Release.config`);

   this.fs.copyTpl(`${src}/webapp.csproj`, `${root}/${this.applicationName}.csproj`, tokens);

   // Now IaC project
   src = `${this.sourceRoot()}/webapp.IaC`;
   root = `${this.applicationName}/${this.applicationName}.IaC`;

   this.fs.copyTpl(`${src}/Deploy-AzureResourceGroup.ps1`, `${root}/Deploy-AzureResourceGroup.ps1`, tokens);
   this.fs.copyTpl(`${src}/webapp.IaC.deployproj`, `${root}/${this.applicationName}.IaC.deployproj`, tokens);
   this.copy(`${src}/WebSite.json`, `${root}/WebSite.json`);
   this.copy(`${src}/Deployment.targets`, `${root}/Deployment.targets`);
   this.copy(`${src}/WebSite.parameters.json`, `${root}/WebSite.parameters.json`);

   // Now test project
   src = `${this.sourceRoot()}/webapp.Tests`;
   root = `${this.applicationName}/${this.applicationName}.Tests`;

   this.copy(`${src}/App.config`, `${root}/App.config`);
   this.copy(`${src}/packages.config`, `${root}/packages.config`);

   this.fs.copyTpl(`${src}/Controllers/HomeControllerTest.cs`, `${root}/Controllers/HomeControllerTest.cs`, tokens);
   this.fs.copyTpl(`${src}/Properties/AssemblyInfo.cs`, `${root}/Properties/AssemblyInfo.cs`, tokens);
   this.fs.copyTpl(`${src}/webapp.Tests.csproj`, `${root}/${this.applicationName}.Tests.csproj`, tokens);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: writeFiles
});