const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.dockerRegistry(this);
      argUtils.dockerRegistryId(this);
      argUtils.dockerRegistryPassword(this);
      argUtils.pat(this);
   }

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting() {
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
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.dockerRegistry = util.reconcileValue(cmdLnInput.options.dockerRegistry, answers.dockerRegistry);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
         this.dockerRegistryId = util.reconcileValue(cmdLnInput.options.dockerRegistryId, answers.dockerRegistryId);
         this.dockerRegistryPassword = util.reconcileValue(cmdLnInput.options.dockerRegistryPassword, answers.dockerRegistryPassword);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
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
};