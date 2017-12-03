"use strict";
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
   args.customFolder(this);   
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
      prompts.customFolder(this),      
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
      this.customFolder = util.reconcileValue(answers.customFolder, cmdLnInput.customFolder, ``);
      this.dockerRegistry = util.reconcileValue(answers.dockerRegistry, cmdLnInput.dockerRegistry);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
      this.dockerRegistryPassword = util.reconcileValue(answers.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword, ``);
   }.bind(this));
}

function configureRelease() {
   // This will not match in callback of
   // getRelease so store it here.
   var _this = this;
   var done = this.async();

   app.getRelease(this, function (e, result) {
      var release = _this.templatePath(result);

      if(_this.type === `custom`) {
         release = path.join(_this.customFolder, result);
      }

      var args = {
         pat: _this.pat,
         tfs: _this.tfs,
         queue: _this.queue,
         target: _this.target,
         releaseJson: release,
         azureSub: _this.azureSub,
         appName: _this.applicationName,
         project: _this.applicationName
      };

      if (util.needsRegistry(_this)) {
         args.dockerHost = _this.dockerHost;
         args.dockerPorts = _this.dockerPorts;
         args.dockerRegistry = _this.dockerRegistry;
         args.dockerRegistryId = _this.dockerRegistryId;
         args.dockerRegistryPassword = _this.dockerRegistryPassword;
      }

      app.run(args, _this, done);
   });
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: configureRelease
});
