const app = require('./app.js');
const util = require(`../app/utility`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
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
   this.argument(`servicePrincipalKey`, {
      required: false,
      desc: `Azure Service Principal Key`
   });
   this.argument(`pat`, {
      required: false,
      desc: `Personal Access Token to TFS/VSTS`
   });
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
      name: `applicationName`,
      type: `input`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: () => {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      name: `azureSub`,
      type: `input`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: answers => {
         return cmdLnInput.azureSub === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      name: `azureSub`,
      type: `list`,
      store: true,
      message: `Which Azure subscription would you like to use?`,
      choices: util.getAzureSubs,
      validate: util.validateAzureSub,
      when: answers => {
         var result = cmdLnInput.azureSub === undefined && util.isVSTS(answers.tfs);

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
      when: (answers) => {
         return cmdLnInput.azureSubId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      type: `input`,
      name: `tenantId`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: (answers) => {
         return cmdLnInput.tenantId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      type: `input`,
      name: `servicePrincipalId`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: (answers) => {
         return cmdLnInput.servicePrincipalId === undefined && !util.isVSTS(answers.tfs);
      }
   }, {
      type: `password`,
      name: `servicePrincipalKey`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: (answers) => {
         return cmdLnInput.servicePrincipalKey === undefined && !util.isVSTS(answers.tfs);
      }
   }]).then(function (a) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(a.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(a.tfs, cmdLnInput.tfs);
      this.azureSub = util.reconcileValue(a.azureSub, cmdLnInput.azureSub);
      this.tenantId = util.reconcileValue(a.tenantId, cmdLnInput.tenantId);
      this.azureSubId = util.reconcileValue(a.azureSubId, cmdLnInput.azureSubId);
      this.applicationName = util.reconcileValue(a.applicationName, cmdLnInput.applicationName);
      this.servicePrincipalId = util.reconcileValue(a.servicePrincipalId, cmdLnInput.servicePrincipalId);
      this.servicePrincipalKey = util.reconcileValue(a.servicePrincipalKey, cmdLnInput.servicePrincipalKey);
   }.bind(this));
}

function createServiceEndpoint() {

   var done = this.async();

   var args = {
      pat: this.pat,
      tfs: this.tfs,
      azureSub: this.azureSub,
      tenantId: this.tenantId,
      azureSubId: this.azureSubId,
      appName: this.applicationName,
      servicePrincipalId: this.servicePrincipalId,
      servicePrincipalKey: this.servicePrincipalKey,
      project: this.applicationName
   };

   app.run(args, this, done);
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing: createServiceEndpoint
});