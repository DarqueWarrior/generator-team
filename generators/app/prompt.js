const util = require(`./utility`);

function tfs(obj) {
   return {
      name: `tfs`,
      type: `input`,
      store: true,
      message: util.getInstancePrompt,
      validate: util.validateTFS,
      filter: util.extractInstance,
      when: answers => {
         // If the value was passed on the commandline it will
         // not be set in answers which other prompts expect.
         // So, place it in answers now.
         answers.tfs = obj.tfs;

         return obj.tfs === undefined;
      }
   };
}

function pat(obj) {
   return {
      name: `pat`,
      type: `password`,
      store: false,
      message: util.getPATPrompt,
      validate: util.validatePersonalAccessToken,
      when: answers => {
         // If the value was passed on the commandline it will
         // not be set in answers which other prompts expect.
         // So, place it in answers now.
         answers.pat = obj.pat;

         return obj.pat === undefined;
      }
   };
}

function queue(obj) {
   return {
      store: true,
      type: `list`,
      name: `queue`,
      default: `Default`,
      choices: util.getPools,
      message: `What agent queue would you like to use?`,
      when: answers => {
         var result = obj.queue === undefined;

         if (result) {
            obj.log(`  Getting Agent Queues...`);
         }

         return result;
      }
   };
}

function applicationType(obj) {
   return {
      name: `type`,
      type: `list`,
      store: true,
      message: `What type of application do you want to create?`,
      default: obj.type,
      choices: util.getAppTypes,
      when: answers => {
         return obj.type === undefined;
      }
   };
}

function applicationName(obj) {
   return {
      name: `applicationName`,
      type: `input`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: () => {
         return obj.applicationName === undefined;
      }
   };
}

function target(obj) {
   return {
      name: `target`,
      type: `list`,
      store: true,
      message: `Where would you like to deploy?`,
      choices: util.getTargets,
      when: answers => {
         return obj.target === undefined;
      }
   };
}

// Azure
function azureSubInput(obj) {
   return {
      name: `azureSub`,
      type: `input`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: answers => {
         return util.isPaaS(answers, obj) && obj.azureSub === undefined && !util.isVSTS(answers.tfs);
      }
   };
}

function azureSubList(obj) {
   return {
      name: `azureSub`,
      type: `list`,
      store: true,
      message: `Which Azure subscription would you like to use?`,
      choices: util.getAzureSubs,
      validate: util.validateAzureSub,
      when: answers => {
         var result = util.isPaaS(answers, obj) && obj.azureSub === undefined && util.isVSTS(answers.tfs);

         if (result) {
            obj.log(`  Getting Azure subscriptions...`);
         }

         return result;
      }
   };
}

function azureSubId(obj) {
   return {
      name: `azureSubId`,
      type: `input`,
      store: true,
      message: `What is your Azure subscription ID?`,
      validate: util.validateAzureSubID,
      when: answers => {
         return util.isPaaS(answers, obj) && obj.azureSubId === undefined && !util.isVSTS(answers.tfs);
      }
   };
}

function servicePrincipalId(obj) {
   return {
      name: `servicePrincipalId`,
      type: `input`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: answers => {
         return util.isPaaS(answers, obj) && obj.servicePrincipalId === undefined && !util.isVSTS(answers.tfs);
      }
   };
}

function tenantId(obj) {
   return {
      name: `tenantId`,
      type: `input`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: answers => {
         return util.isPaaS(answers, obj) && obj.tenantId === undefined && !util.isVSTS(answers.tfs);
      }
   };
}

function servicePrincipalKey(obj) {
   return {
      type: `password`,
      name: `servicePrincipalKey`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: answers => {
         return util.isPaaS(answers, obj) && obj.servicePrincipalKey === undefined && !util.isVSTS(answers.tfs);
      }
   };
}

// Docker
function dockerHost(obj) {
   return {
      name: `dockerHost`,
      type: `input`,
      store: true,
      message: `What is your Docker host url and port (tcp://host:2376)?`,
      validate: util.validateDockerHost,
      when: answers => {
         return util.needsDockerHost(answers, obj) && obj.dockerHost === undefined;
      }
   };
}

function dockerCertPath(obj) {
   return {
      name: `dockerCertPath`,
      type: `input`,
      store: true,
      message: `What is your Docker Certificate Path?`,
      validate: util.validateDockerCertificatePath,
      when: answers => {
         return util.needsDockerHost(answers, obj) && obj.dockerCertPath === undefined;
      }
   };
}

function dockerRegistry(obj) {
   return {
      name: `dockerRegistry`,
      type: `input`,
      default: `https://index.docker.io/v1/`,
      store: true,
      message: `What is your Docker Registry URL?`,
      validate: util.validateDockerRegistry,
      when: answers => {
         return util.needsRegistry(answers, obj) && obj.dockerRegistry === undefined;
      }
   };
}

function dockerRegistryUsername(obj) {
   return {
      name: `dockerRegistryId`,
      type: `input`,
      store: true,
      message: `What is your Docker Registry username (case sensitive)?`,
      validate: util.validateDockerHubID,
      when: answers => {
         return util.needsRegistry(answers, obj) && obj.dockerRegistryId === undefined;
      }
   };
}

function dockerRegistryPassword(obj) {
   return {
      name: `dockerRegistryPassword`,
      type: `password`,
      store: false,
      message: `What is your Docker Registry password?`,
      validate: util.validateDockerHubPassword,
      when: answers => {
         return util.needsRegistry(answers, obj) && obj.dockerRegistryPassword === undefined;
      }
   };
}

function dockerPorts(obj) {
   return {
      name: `dockerPorts`,
      type: `input`,
      default: util.getDefaultPortMapping,
      message: `What port should be exposed?`,
      validate: util.validatePortMapping,
      when: answers => {
         return util.needsRegistry(answers, obj) && obj.dockerPorts === undefined;
      }
   };
}

// Java
function groupId(obj) {
   return {
      name: `groupId`,
      type: `input`,
      store: true,
      message: "What is your Group ID?",
      validate: util.validateGroupID,
      when: answers => {
         return answers.type === `java` && obj.groupId === undefined;
      }
   };
}

function installDep(obj) {
   return {
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
         return answers.type !== `aspFull` && obj.installDep === undefined;
      }
   };
}

function gitAction(obj) {
   return {
      type: `list`,
      name: `action`,
      store: false,
      message: `What Git actions would you like to take?`,
      choices: [{
         name: `Clone`,
         value: `clone`
      }, {
         name: `Add & Commit`,
         value: `commit`
      }],
      when: function () {
         return obj.action === undefined;
      }
   };
}

module.exports = {
   tfs: tfs,
   pat: pat,
   queue: queue,
   target: target,
   groupId: groupId,
   tenantId: tenantId,
   gitAction: gitAction,
   installDep: installDep,
   azureSubId: azureSubId,
   dockerHost: dockerHost,
   dockerPorts: dockerPorts,
   azureSubList: azureSubList,
   azureSubInput: azureSubInput,
   dockerRegistry: dockerRegistry,
   dockerCertPath: dockerCertPath,
   applicationType: applicationType,
   applicationName: applicationName,
   servicePrincipalId: servicePrincipalId,
   servicePrincipalKey: servicePrincipalKey,
   dockerRegistryPassword: dockerRegistryPassword,
   dockerRegistryUsername: dockerRegistryUsername
};