const app = require('./app.js');
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require('yeoman-generator');

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.applicationName(this);
   args.tfs(this);
   args.azureSub(this);
   args.azureSubId(this);
   args.tenantId(this);
   args.servicePrincipalId(this);
   args.servicePrincipalKey(this);
   args.pat(this);
}

function input() {
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
      this.pat = util.reconcileValue(cmdLnInput.pat, answers.pat);
      this.tfs = util.reconcileValue(cmdLnInput.tfs, answers.tfs);
      this.azureSub = util.reconcileValue(cmdLnInput.azureSub, answers.azureSub);
      this.tenantId = util.reconcileValue(cmdLnInput.tenantId, answers.tenantId);
      this.azureSubId = util.reconcileValue(cmdLnInput.azureSubId, answers.azureSubId);
      this.applicationName = util.reconcileValue(cmdLnInput.applicationName, answers.applicationName);
      this.servicePrincipalId = util.reconcileValue(cmdLnInput.servicePrincipalId, answers.servicePrincipalId);
      this.servicePrincipalKey = util.reconcileValue(cmdLnInput.servicePrincipalKey, answers.servicePrincipalKey);
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