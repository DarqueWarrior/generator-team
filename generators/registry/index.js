const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.applicationName(this);
   args.tfs(this);
   args.dockerRegistry(this);
   args.dockerRegistryId(this);
   args.dockerRegistryPassword(this);
   args.pat(this);
}

// Collect any missing data from the user.
function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.tfs(this),
      prompts.pat(this),
      prompts.applicationName(this),
      prompts.dockerRegistry(this),
      prompts.dockerRegistryUsername(this),
      prompts.dockerRegistryPassword(this)
   ]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(cmdLnInput.pat, answers.pat);
      this.tfs = util.reconcileValue(cmdLnInput.tfs, answers.tfs);
      this.dockerRegistry = util.reconcileValue(cmdLnInput.dockerRegistry, answers.dockerRegistry);
      this.applicationName = util.reconcileValue(cmdLnInput.applicationName, answers.applicationName);
      this.dockerRegistryId = util.reconcileValue(cmdLnInput.dockerRegistryId, answers.dockerRegistryId);
      this.dockerRegistryPassword = util.reconcileValue(cmdLnInput.dockerRegistryPassword, answers.dockerRegistryPassword);
   }.bind(this));
}

function createServiceEndpoint() {
   var done = this.async();

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      appName: this.applicationName,
      project: this.applicationName,
      dockerRegistry: this.dockerRegistry,
      dockerRegistryId: this.dockerRegistryId,
      dockerRegistryPassword: this.dockerRegistryPassword
   };

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: createServiceEndpoint
});