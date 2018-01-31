const app = require('./app.js');
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.applicationName(this);
      argUtils.tfs(this);
      argUtils.azureSub(this);
      argUtils.azureSubId(this);
      argUtils.tenantId(this);
      argUtils.servicePrincipalId(this);
      argUtils.servicePrincipalKey(this);
      argUtils.pat(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      // Collect any missing data from the user.
      // This gives me access to the generator in the
      // when callbacks of prompt
      let cmdLnInput = this;

      // When this generator is called alone as in team:azure
      // we have to make sure the prompts below realize they
      // need to get a subscription. If we don't setup everything
      // right now the user will not be asked for a subscription.
      cmdLnInput.target = `paas`;

      return this.prompt([
         prompts.tfs(this),
         prompts.pat(this),
         prompts.applicationName(this),
         prompts.azureSubInput(this),
         prompts.azureSubList(this),
         prompts.azureSubId(this),
         prompts.tenantId(this),
         prompts.servicePrincipalId(this),
         prompts.servicePrincipalKey(this),
      ]).then(function (answers) {
         // Transfer answers to local object for use in the rest of the generator
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.azureSub = util.reconcileValue(cmdLnInput.options.azureSub, answers.azureSub);
         this.tenantId = util.reconcileValue(cmdLnInput.options.tenantId, answers.tenantId);
         this.azureSubId = util.reconcileValue(cmdLnInput.options.azureSubId, answers.azureSubId);
         this.applicationName = util.reconcileValue(cmdLnInput.options.applicationName, answers.applicationName);
         this.servicePrincipalId = util.reconcileValue(cmdLnInput.options.servicePrincipalId, answers.servicePrincipalId);
         this.servicePrincipalKey = util.reconcileValue(cmdLnInput.options.servicePrincipalKey, answers.servicePrincipalKey);
      }.bind(this));
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {

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
};