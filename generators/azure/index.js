const app = require('./app.js');
const util = require(`../app/utility`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   this.argument(`applicationName`, { required: false, desc: `name of the application` });
   this.argument(`tfs`, { required: false, desc: `full tfs URL including collection or Team Services account name` });
   this.argument(`azureSub`, { required: false, desc: `Azure Subscription name` });
   this.argument(`azureSubId`, { required: false, desc: `Azure Subscription ID` });
   this.argument(`tenantId`, { required: false, desc: `Azure Tenant ID` });
   this.argument(`servicePrincipalId`, { required: false, desc: `Azure Service Principal Id` });
   this.argument(`servicePrincipalKey`, { required: false, desc: `Azure Service Principal Key` });
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
      message: `What is your TFS URL including collection\n  i.e. http://tfs:8080/tfs/DefaultCollection?`,
      validate: util.validateTFS,
      when: function () {
         return cmdLnInput.tfs === undefined;
      }
   }, {
      type: `password`,
      name: `pat`,
      store: false,
      message: `What is your TFS Access Token?`,
      validate: util.validatePersonalAccessToken,
      when: function () {
         return cmdLnInput.pat === undefined;
      }
   }, {
      type: `input`,
      name: `applicationName`,
      store: true,
      message: `What is the name of your application?`,
      validate: util.validateApplicationName,
      when: function () {
         return cmdLnInput.applicationName === undefined;
      }
   }, {
      type: `input`,
      name: `azureSub`,
      store: true,
      message: `What is your Azure subscription name?`,
      validate: util.validateAzureSub,
      when: function (a) {
         return cmdLnInput.azureSub === undefined && !util.isVSTS(a.tfs);
      }
   }, {
      type: `list`,
      name: `azureSub`,
      store: true,
      message: `Which Azure subscription would you like to use?`,
      choices: util.getAzureSubs,
      validate: util.validateAzureSub,
      when: function (a) {
         var result = cmdLnInput.azureSub === undefined && util.isVSTS(a.tfs);

         if (result) {
            cmdLnInput.log(`  Getting Azure subscriptions...`);
         }

         return result;
      }
   }, {
      type: `input`,
      name: `azureSubId`,
      store: true,
      message: `What is your Azure subscription ID?`,
      validate: util.validateAzureSubID,
      when: function () {
         return cmdLnInput.azureSubId === undefined;
      }
   }, {
      type: `input`,
      name: `tenantId`,
      store: true,
      message: `What is your Azure Tenant ID?`,
      validate: util.validateAzureTenantID,
      when: function () {
         return cmdLnInput.tenantId === undefined;
      }
   }, {
      type: `input`,
      name: `servicePrincipalId`,
      store: true,
      message: `What is your Service Principal ID?`,
      validate: util.validateServicePrincipalID,
      when: function () {
         return cmdLnInput.servicePrincipalId === undefined;
      }
   }, {
      type: `password`,
      name: `servicePrincipalKey`,
      store: false,
      message: `What is your Service Principal Key?`,
      validate: util.validateServicePrincipalKey,
      when: function () {
         return cmdLnInput.servicePrincipalKey === undefined;
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