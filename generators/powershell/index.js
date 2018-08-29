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
      argUtils.functionName(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      return this.prompt([
         prompts.applicationName(this),
         prompts.functionName(this),
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
         this.functionName = util.reconcileValue(cmdLnInput.options.functionName, answers.functionName);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      var date = new Date();

      var day = date.getDate();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;

      var tokens = {
         name: this.applicationName,
         name_lowercase: this.applicationName.toLowerCase(),
         functionName: this.functionName,
         guid: uuidV4(),
         date: `${month}/${day}/${year}`,
         year: year
      };

      var src = this.sourceRoot();
      var root = this.applicationName;

      this.fs.copy(`${src}/readme.md`, `${root}/readme.md`);
      this.fs.copy(`${src}/gitignore`, `${root}/.gitignore`);
      this.fs.copy(`${src}/module.psm1`, `${root}/${this.applicationName}.psm1`);
      this.fs.copyTpl(`${src}/module.psd1`, `${root}/${this.applicationName}.psd1`, tokens);
      
      // Classes
      src = `${this.sourceRoot()}/Classes`;
      root = `${this.applicationName}/Classes`;

      this.fs.copy(`${src}/Classes.ps1`, `${root}/Classes.ps1`);

      // Internal
      src = `${this.sourceRoot()}/Internal`;
      root = `${this.applicationName}/Internal`;

      this.fs.copyTpl(`${src}/Internal.ps1`, `${root}/Internal.ps1`, tokens);
      
      // Public
      src = `${this.sourceRoot()}/Public`;
      root = `${this.applicationName}/Public`;

      this.fs.copyTpl(`${src}/function.ps1`, `${root}/${this.functionName}.ps1`, tokens);

      // Tests
      src = `${this.sourceRoot()}/Tests`;
      root = `${this.applicationName}/Tests`;

      this.fs.copyTpl(`${src}/function.tests.ps1`, `${root}/${this.functionName}.tests.ps1`, tokens);

      // .docs
      src = `${this.sourceRoot()}/.docs`;
      root = `${this.applicationName}/.docs`;

      this.fs.copyTpl(`${src}/common/header.md`, `${root}/common/header.md`, tokens);
      this.fs.copy(`${src}/common/description.md`, `${root}/common/description.md`, tokens);
      this.fs.copyTpl(`${src}/synopsis/function.md`, `${root}/synopsis/${this.functionName}.md`, tokens);
      this.fs.copyTpl(`${src}/function.md`, `${root}/${this.functionName}.md`, tokens);
      this.fs.copyTpl(`${src}/index.md`, `${root}/index.md`, tokens);
      this.fs.copyTpl(`${src}/readme.md`, `${root}/readme.md`, tokens);
      this.fs.copyTpl(`${src}/about.md`, `${root}/about_${this.applicationName}.md`, tokens);
      this.fs.copy(`${src}/gen-help.ps1`, `${root}/gen-help.ps1`);
   }
};