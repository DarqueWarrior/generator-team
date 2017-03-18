// This is the main entry point of the generator.  The heavy lifting is done in the
// sub generators.  I separated them so I could compose with language generators.
const url = require(`url`);
const yosay = require(`yosay`);
const util = require(`./utility`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important
   // These are position based arguments for this generator. If they are not provided
   // via the command line they will be queried during the prompting priority
   this.argument(`type`, {
      required: false,
      desc: `project type to create (asp, node or java)`
   });
   this.argument(`applicationName`, {
      required: false,
      desc: `name of the application`
   });
   this.argument(`tfs`, {
      required: false,
      desc: `full tfs URL including collection or Team Services account name`
   });
   this.argument(`azureSub`, {
      required: false,
      desc: `Azure Subscription name`
   });
   this.argument(`azureSubId`, {
      required: false,
      desc: `Azure Subscription ID`
   });
   this.argument(`tenantId`, {
      required: false,
      desc: `Azure Tenant ID`
   });
   this.argument(`servicePrincipalId`, {
      required: false,
      desc: `Azure Service Principal Id`
   });
   this.argument(`queue`, {
      required: false,
      desc: `agent queue name to use`
   });
   this.argument(`target`, {
      required: false,
      desc: `docker or Azure app service`
   });
   this.argument(`installDep`, {
      required: false,
      desc: `if true dependencies are installed`
   });
   this.argument(`groupId`, {
      required: false,
      desc: `groupId of Java project`
   });
   this.argument(`dockerHost`, {
      required: false,
      desc: `Docker host url including port`
   });
   this.argument(`dockerCertPath`, {
      required: false,
      desc: `path to Docker certs folder`
   });
   this.argument(`dockerRegistry`, {
      required: false,
      desc: `server of your Docker registry`
   });
   this.argument(`dockerRegistryId`, {
      required: false,
      desc: `username for Docker registry`
   });
   this.argument(`dockerPorts`, {
      required: false,
      desc: `port mapping for container and host`
   });
   this.argument(`dockerRegistryPassword`, {
      required: false,
      desc: `password for your Docker registry`
   });
   this.argument(`servicePrincipalKey`, {
      required: false,
      desc: `Azure Service Principal Key`
   });
   this.argument(`pat`, {
      required: false,
      desc: `Personal Access Token to TFS/VSTS`
   });
}

function init() {
   // Store all the values collected from the command line so we can pass to 
   // sub generators. I also use this to determine which data I still need to
   // prompt for.

   this.log(yosay(`Welcome to DevOps powered by Microsoft`));
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([{
      name: `tfs`,
      type: `input`,
      store: true,
      message: util.getInstancePrompt,
      validate: util.validateTFS,
      when: () => {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      name: `pat`,
      type: `password`,
      store: false,
      message: util.getPATPrompt,
      validate: util.validatePersonalAccessToken,
      when: () => {
         return cmdLnInput.pat === undefined;
      }
   }, {
      name: `queue`,
      type: `list`,
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
      name: `type`,
      type: `list`,
      store: true,
      message: `What type of application do you want to create?`,
      default: cmdLnInput.type,
      choices: util.getAppTypes,
      when: answers => {
         return cmdLnInput.type === undefined;
      }
   }, {
      name: `applicationName`,
      type: `input`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: () => {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      name: `target`,
      type: `list`,
      store: true,
      message: `Where would you like to deploy?`,
      choices: util.getTargets,
      when: answers => {
         return cmdLnInput.target === undefined;
      }
   }, {
      name: `azureSub`,
      type: `input`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSub === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `azureSub`,
      type: `list`,
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
      name: `azureSubId`,
      type: `input`,
      store: true,
      message: `What is your Azure subscription ID?`,
      validate: util.validateAzureSubID,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.azureSubId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `tenantId`,
      type: `input`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.tenantId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `servicePrincipalId`,
      type: `input`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.servicePrincipalId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `servicePrincipalKey`,
      type: `password`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: answers => {
         return (answers.target === `paas` || cmdLnInput.target === `paas`) && cmdLnInput.servicePrincipalKey === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `dockerHost`,
      type: `input`,
      store: true,
      message: `What is your Docker host url and port (tcp://host:2376)?`,
      validate: util.validateDockerHost,
      when: answers => {
         // If you pass in the target on the command line 
         // answers.target will be undefined so test cmdLnInput
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerHost === undefined;
      }
   }, {
      name: `dockerCertPath`,
      type: `input`,
      store: true,
      message: `What is your Docker Certificate Path?`,
      validate: util.validateDockerCertificatePath,
      when: answers => {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerCertPath === undefined;
      }
   }, {
      name: `dockerRegistry`,
      type: `input`,
      default: `https://index.docker.io/v1/`,
      store: true,
      message: `What is your Docker Registry URL?`,
      validate: util.validateDockerRegistry,
      when: answers => {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistry === undefined;
      }
   }, {
      name: `dockerRegistryId`,
      type: `input`,
      store: true,
      message: `What is your Docker Registry username (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: answers => {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryId === undefined;
      }
   }, {
      name: `dockerRegistryPassword`,
      type: `password`,
      store: false,
      message: `What is your Docker Registry password?`,
      validate: util.validateDockerHubPassword,
      when: answers => {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerRegistryPassword === undefined;
      }
   }, {
      name: `dockerPorts`,
      type: `input`,
      default: util.getDefaultPortMapping,
      message: `What should the port mapping be?`,
      validate: util.validatePortMapping,
      when: answers => {
         return (answers.target === `docker` || cmdLnInput.target === `docker`) && cmdLnInput.dockerPorts === undefined;
      }
   }, {
      name: `groupId`,
      type: `input`,
      store: true,
      message: "What is your Group ID?",
      validate: util.validateGroupID,
      when: answers => {
         return answers.type === `java` && cmdLnInput.groupId === undefined;
      }
   }, {
      name: `installDep`,
      type: `list`,
      store: true,
      message: "Install dependencies?",
      default: `false`,
      choices: [{
            name: `Yes`,
            value: `true`
         },
         {
            name: `No`,
            value: `false`
         }
      ],
      when: answers => {
         return answers.type !== `aspFull` && cmdLnInput.installDep === undefined;
      }
   }]).then(function (answers) {
      // Transfer answers to global object for use in the rest of the generator
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
   this.composeWith(`team:git`, {
      args: [this.applicationName, this.tfs,
         `all`,
         this.pat
      ]
   });

   if (this.type === `asp`) {
      this.composeWith(`team:asp`, {
         args: [this.applicationName, this.installDep]
      });
   } else if (this.type === `aspFull`) {
      this.composeWith(`team:aspFull`, {
         args: [this.applicationName]
      });
   } else if (this.type === `java`) {
      this.composeWith(`team:java`, {
         args: [this.applicationName, this.groupId, this.installDep]
      });
   } else {
      this.composeWith(`team:node`, {
         args: [this.applicationName, this.installDep]
      });
   }

   if (this.target === `docker`) {
      this.composeWith(`team:docker`, {
         args: [this.applicationName, this.tfs,
            this.dockerHost, this.dockerCertPath,
            this.pat
         ]
      });

      this.composeWith(`team:registry`, {
         args: [this.applicationName, this.tfs,
            this.dockerRegistry, this.dockerRegistryId, this.dockerRegistryPassword,
            this.pat
         ]
      });
   }

   if (this.target === `paas`) {
      this.composeWith(`team:azure`, {
         args: [this.applicationName, this.tfs,
            this.azureSub, this.azureSubId, this.tenantId, this.servicePrincipalId, this.servicePrincipalKey,
            this.pat
         ]
      });
   }

   this.composeWith(`team:build`, {
      args: [this.type, this.applicationName, this.tfs,
         this.queue, this.target,
         this.dockerHost, this.dockerRegistry, this.dockerRegistryId,
         this.pat
      ]
   });

   this.composeWith(`team:release`, {
      args: [this.type, this.applicationName, this.tfs,
         this.queue, this.target,
         this.azureSub,
         this.dockerHost, this.dockerRegistry, this.dockerRegistryId, this.dockerPorts,
         this.pat
      ]
   });

   this.composeWith(`team:project`, {
      args: [this.applicationName, this.tfs,
         this.pat
      ]
   });
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