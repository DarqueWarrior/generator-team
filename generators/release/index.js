const url = require(`url`);
const path = require(`path`);
const app = require(`./app.js`);
const util = require(`../app/utility`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`type`, { required: false, desc: `project type to create (asp, node or java)` });
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument(`tfs`, { required: false, desc: `full tfs URL including collection or Team Services account name` });
   this.argument(`queue`, { required: false, desc: `agent queue name to use` });
   this.argument(`target`, { required: false, desc: `docker or Azure app service` });
   this.argument(`azureSub`, { required: false, desc: `Azure Subscription name` });
   this.argument(`dockerHost`, { required: false, desc: `Docker host url including port` });
   this.argument(`dockerRegistryId`, { required: false, desc: `ID for Docker repository` });
   this.argument(`dockerPorts`, { required: false, desc: `port mapping for container and host` });
   this.argument(`pat`, { required: false, desc: `Personal Access Token to TFS/VSTS` });
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([{
      type: `input`,
      name: `tfs`,
      store: true,
      message: util.getInstancePrompt,
      validate: util.validateTFS,
      when: answers => {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: util.getPATPrompt,
      validate: util.validatePersonalAccessToken,
      when: answers => {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `list`,
      name: `queue`,
      store: true,
      message: `What agent queue would you like to use?`,
      default: `Default`,
      choices: util.getPools,
      when: answers => {
         var result = cmdLnInput.queue === undefined;

         if (result) {
            cmdLnInput.log(`  Getting Agent Queues...`);
         }

         return result;
      }
   }, {
      type: `list`,
      name: `type`,
      store: true,
      message: `What type of application do you want to create?`,
      default: cmdLnInput.type,
      choices: util.getAppTypes,
      when: answers => {
         return cmdLnInput.type === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: answers => {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `list`,
      name: `target`,
      store: true,
      message: `Where would you like to deploy?`,
      choices: util.getTargets,
      when: answers => {
         return cmdLnInput.target === undefined;
      }
   }, {
      type: `input`,
      name: `azureSub`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSub === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      type: `list`,
      name: `azureSub`,
      store: true,
      message: `Which Azure subscription would you like to use?`,
      choices: util.getAzureSubs,
      validate: util.validateAzureSub,
      when: answers => {
         var result = (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSub === undefined && util.isVSTS(answers.tfs);

         if (result) {
            cmdLnInput.log(`  Getting Azure subscriptions...`);
         }

         return result;
      }
   }, {
      type: `input`,
      name: `dockerHost`,
      store: true,
      message: `What is your Docker host url and port (tcp://host:2376)?`,
      validate: util.validateDockerHost,
      when: function (answers) {
         // If you pass in the target on the command line 
         // answers.target will be undefined so test cmdLnInput
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerHost === undefined;
      }
   }, {
      type: `input`,
      name: `dockerRegistryId`,
      store: true,
      message: `What is your Docker Hub ID (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      type: `input`,
      name: `dockerPorts`,
      default: util.getDefaultPortMapping,
      message: `What should the port mapping be?`,
      validate: util.validatePortMapping,
      when: function (answers) {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerPorts === undefined;
      }
   }]).then(function (answers) {
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
      this.applicationName = util.reconcileValue(answers.applicationName, cmdLnInput.applicationName, ``);
      this.dockerRegistryId = util.reconcileValue(answers.dockerRegistryId, cmdLnInput.dockerRegistryId, ``);
   }.bind(this));
}

function configureRelase() {
   var done = this.async();

   var release = this.templatePath(`release.json`);

   if (this.type === `asp`) {
      if (this.target === `docker`) {
         release = this.templatePath(`release_docker.json`);
      }
   } else if (this.type === `node`) {
      if (this.target === `docker`) {
         release = this.templatePath(`release_docker.json`);
      }
   } else {
      if (this.target === `docker`) {
         release = this.templatePath(`release_docker.json`);
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

   if (this.target === `docker`) {
      // We only support Docker Hub so set the dockerRegistry to 
      // https://index.docker.io/v1/
      var registry = `https://index.docker.io/v1/`;

      args.dockerRegistry = registry;
      args.dockerHost = this.dockerHost;
      args.dockerPorts = this.dockerPorts;
      args.dockerRegistryId = this.dockerRegistryId;
   }
   
   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,
   
   // 2. Where you prompt users for options (where you`d call this.prompt())
   prompting: input,
      
   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: configureRelase
});