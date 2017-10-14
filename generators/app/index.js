// This is the main entry point of the generator.  The heavy lifting is done in the
// sub generators.  I separated them so I could compose with language generators.
const url = require(`url`);
const yosay = require(`yosay`);
const args = require(`./args`);
const util = require(`./utility`);
const prompts = require(`./prompt`);
const compose = require(`../app/compose`);
const package = require('../../package.json');
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
   args.azureSub(this);
   args.azureSubId(this);
   args.tenantId(this);
   args.servicePrincipalId(this);
   args.queue(this);
   args.target(this);
   args.installDep(this);
   args.groupId(this);
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

function init() {
   // Store all the values collected from the command line so we can pass to 
   // sub generators. I also use this to determine which data I still need to
   // prompt for.

   this.log(yosay(`Welcome to DevOps powered by Microsoft version ${package.version}`));
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
      prompts.groupId(this),
      prompts.installDep(this)
   ]).then(function (answers) {
      // Transfer answers to global object for use in the rest of the generator

      // When passing in parameter from the command line passing in more than are 
      // needed can cause issues.  When using the prompts data is not asked for that
      // is not needed and the code works on the assumption that if you provided it
      // I needed it which is not always the case. For example, if you are using the
      // Hosted Linux queue you should not provide a Docker Host. But if you do
      // it will mess things up. So I am going to try and determine if I need to clear
      // additional information that was provided but not required. 
      if(!util.needsDockerHost(answers, cmdLnInput)) {
         answers.dockerHost = undefined;
         cmdLnInput.dockerHost = undefined;
      }

      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.type = util.reconcileValue(answers.type, cmdLnInput.type);
      this.queue = util.reconcileValue(answers.queue, cmdLnInput.queue);
      this.target = util.reconcileValue(answers.target, cmdLnInput.target);
      this.groupId = util.reconcileValue(answers.groupId, cmdLnInput.groupId, ``);
      this.azureSub = util.reconcileValue(answers.azureSub, cmdLnInput.azureSub, ``);
      this.tenantId = util.reconcileValue(answers.tenantId, cmdLnInput.tenantId, ``);
      this.installDep = util.reconcileValue(answers.installDep, cmdLnInput.installDep);
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
   compose.addGit(this);
   compose.addLanguage(this);
   compose.addDockerHost(this);
   compose.addRegistry(this);
   compose.addAzure(this);
   compose.addBuild(this);
   compose.addRelease(this);
   compose.addProject(this);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 1. Your initialization methods (checking current project state, getting configs, etc)
   initializing: init,

   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: configGenerators
});