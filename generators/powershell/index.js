const path = require(`path`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require(`yeoman-generator`);
const uuidv4 = require('uuid/v4');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.applicationName(this);
   args.powershellAuthor(this);
   args.powershellDescription(this);
}

// Collect any missing data from the user.
function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   // if you run just the team:powershell generator
   // type is not set and Author and description do not prompt
   this.type = `powershell`

   return this.prompt([
      prompts.applicationName(this),
      prompts.powershellAuthor(this),
      prompts.powershellDescription(this),
   ]).then(function (answers) {
      // Transfer answers (a) to global object (cmdLnInput) for use in the rest
      // of the generator
      // If the gave you a answer from the prompt use it. If not check the 
      // command line.  If that is blank for some return `` so code does not
      // crash with undefined later on.
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.powershellAuthor = util.reconcileValue(answers.powershellAuthor, cmdLnInput.powershellAuthor, ``);
      this.powershellDescription = util.reconcileValue(answers.powershellDescription, cmdLnInput.powershellDescription, ``);
   }.bind(this));
}

function writeFiles() {
   var tokens = {
      name: this.applicationName,
      guid: uuidv4(),
      author: this.powershellAuthor,
      description: this.powershellDescription,
   };

   var src = this.sourceRoot();
   var root = this.applicationName;

   this.copy(`${src}/.gitignore`, `${root}/.gitignore`);
   this.fs.copyTpl(`${src}/README.md`, `${root}/README.md`, tokens);
   this.fs.copyTpl(`${src}/build.ps1`, `${root}/build.ps1`, tokens);
   this.fs.copyTpl(`${src}/moduleManifest.psd1`, `${root}/${this.applicationName}.psd1`, tokens);
   this.fs.copyTpl(`${src}/test/moduleManifest.Tests.ps1`, `${root}/test/${this.applicationName}.Tests.ps1`, tokens);
   this.fs.copy(`${src}/module.psm1`, `${root}/${this.applicationName}.psm1`)
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: writeFiles
});