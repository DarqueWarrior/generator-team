// All this generator does is compose the others to build just a pipeline.
// This will be helpful if you already have a project and just want the CI/CD
// setup for it.  Or you ran yo tfs once and want to add an additional pipeline.
"use strict";
const url = require(`url`);
const yosay = require(`yosay`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const compose = require(`../app/compose`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important
   // These are position based arguments for this generator. If they are not provided
   // via the command line they will be queried during the prompting priority
   args.applicationType(this);
   args.applicationName(this);
   args.tfs(this);
   args.queue(this);
   args.target(this);
   args.azureSub(this);
   args.azureSubId(this);
   args.tenantId(this);
   args.servicePrincipalId(this);
   args.dockerHost(this);
   args.dockerCertPath(this);
   args.dockerRegistry(this);
   args.dockerRegistryId(this);
   args.dockerPorts(this);
   args.dockerRegistryPassword(this);
   args.servicePrincipalKey(this);
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
      prompts.azureSubId(this),
      prompts.tenantId(this),
      prompts.servicePrincipalId(this),
      prompts.servicePrincipalKey(this),
      prompts.dockerHost(this),
      prompts.dockerCertPath(this),
      prompts.dockerRegistry(this),
      prompts.dockerRegistryUsername(this),
      prompts.dockerRegistryPassword(this),
      prompts.dockerPorts(this),
   ]).then(function (answers) {
      // Transfer answers (answers) to global object (cmdLnInput) for use in the rest
      // of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.type = util.reconcileValue(answers.type, cmdLnInput.type);
      this.queue = util.reconcileValue(answers.queue, cmdLnInput.queue);
      this.target = util.reconcileValue(answers.target, cmdLnInput.target);
      this.azureSub = util.reconcileValue(answers.azureSub, cmdLnInput.azureSub, ``);
      this.tenantId = util.reconcileValue(answers.tenantId, cmdLnInput.tenantId, ``);
      this.azureSubId = util.reconcileValue(answers.azureSubId, cmdLnInput.azureSubId, ``);
      this.dockerHost = util.reconcileValue(answers.dockerHost, cmdLnInput.dockerHost, ``);
      this.dockerPorts = util.reconcileValue(answers.dockerPorts, cmdLnInput.dockerPorts, ``);
      this.customFolder = util.reconcileValue(answers.customFolder, cmdLnInput.customFolder, ``);
      this.dockerRegistry = util.reconcileValue(answers.dockerRegistry, cmdLnInput.dockerRegistry, ``);
      this.dockerCertPath = util.reconcileValue(answers.dockerCertPath, cmdLnInput.dockerCertPath, ``);
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
      this.servicePrincipalId = util.reconcileValue(answers.servicePrincipalId, cmdLnInput.servicePrincipalId, ``);
      this.servicePrincipalKey = util.reconcileValue(answers.servicePrincipalKey, cmdLnInput.servicePrincipalKey, ``);
      this.dockerRegistryPassword = util.reconcileValue(answers.dockerRegistryPassword, cmdLnInput.dockerRegistryPassword, ``);
   }.bind(this));
}

function configGenerators() {
   // Based on the users answers compose all the required generators.
   compose.addDockerHost(this);
   compose.addRegistry(this);
   compose.addAzure(this);
   compose.addBuild(this);
   compose.addRelease(this);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: configGenerators
});
