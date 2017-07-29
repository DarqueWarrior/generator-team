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
   args.applicationType(this);
   args.applicationName(this);
   args.tfs(this);
   args.queue(this);
   args.target(this);
   args.azureSub(this);
   args.dockerHost(this);
   args.dockerRegistry(this);
   args.dockerRegistryId(this);
   args.dockerPorts(this);
   args.dockerRegistryPassword(this);
   args.pat(this);
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.tfs(this),
      prompts.pat(this),
      prompts.queue(this),
      prompts.applicationType(this),
      prompts.applicationName(this),
      prompts.target(this),
      prompts.azureSubInput(this),
      prompts.azureSubList(this),
      prompts.dockerHost(this),
      prompts.dockerRegistry(this),
      prompts.dockerRegistryUsername(this),
      prompts.dockerRegistryPassword(this),
      prompts.dockerPorts(this)
   ]).then(function (answers) {
      // Transfer answers (a) to global object (cmdLnInput) for use in the rest
      // of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.type = util.reconcileValue(answers.type, cmdLnInput.type);
      this.queue = util.reconcileValue(answers.queue, cmdLnInput.queue);
      this.target = util.reconcileValue(answers.target, cmdLnInput.target);
      this.azureSub = util.reconcileValue(answers.azureSub, cmdLnInput.azureSub, ``);
      this.dockerHost = util.reconcileValue(answers.dockerHost, cmdLnInput.dockerHost, ``);
      this.dockerPorts = util.reconcileValue(answers.dockerPorts, cmdLnInput.dockerPorts, ``);
      this.dockerRegistry = util.reconcileValue(answers.dockerRegistry, cmdLnInput.dockerRegistry);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
      this.dockerRegistryPassword = util.reconcileValue(answers.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword, ``);
   }.bind(this));
}

function configureRelease() {
   var done = this.async();

   var release = this.templatePath(`tfs_release.json`);

   if (util.isVSTS(this.tfs)) {
      release = this.templatePath(`vsts_release.json`);
   }

   if (this.target === `docker`) {
      if (util.isVSTS(this.tfs)) {
         release = this.templatePath(`vsts_release_docker.json`);
      } else {
         release = this.templatePath(`tfs_release_docker.json`);
      }
   }

   if (this.target === `dockerpaas`) {
      if (util.isVSTS(this.tfs)) {
         release = this.templatePath(`vsts_release_dockerpaas.json`);
      } else {
         release = this.templatePath(`tfs_release_dockerpaas.json`);
      }
   }

   if (this.target === `acilinux`) {
      if (util.isVSTS(this.tfs)) {
         release = this.templatePath(`vsts_release_acilinux.json`);
      } else {
         release = this.templatePath(`tfs_release_acilinux.json`);
      }
   }

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      queue: this.queue,
      target: this.target,
      releaseJson: release,
      azureSub: this.azureSub,
      appName: this.applicationName,
      project: this.applicationName
   };

   if (util.needsRegistry(this)) {
      args.dockerHost = this.dockerHost;
      args.dockerPorts = this.dockerPorts;
      args.dockerRegistry = this.dockerRegistry;
      args.dockerRegistryId = this.dockerRegistryId;
      args.dockerRegistryPassword = this.dockerRegistryPassword;
   }

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: configureRelease
});