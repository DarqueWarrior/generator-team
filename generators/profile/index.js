const fs = require('fs');
const os = require('os');
const pad = require('pad');
const path = require(`path`);
const args = require(`../app/args`);
const util = require(`../app/utility`);
const prompts = require(`../app/prompt`);
const generators = require(`yeoman-generator`);

function construct() {
   // Calling the super constructor is important so our generator is correctly set up
   generators.Base.apply(this, arguments);

   // Order is important 
   args.profileCmd(this);
   args.profileName(this);
   args.tfs(this);
   args.pat(this);
   args.tfsVersion(this);
}

function input() {
   // Collect any missing data from the user.
   // This gives me access to the generator in the
   // when callbacks of prompt
   let cmdLnInput = this;

   return this.prompt([
      prompts.profileCmd(this),
      prompts.profileName(this),
      prompts.tfs(this),
      prompts.pat(this),
      prompts.tfsVersion(this)
   ]).then(function (answers) {
      // Transfer answers to local object for use in the rest of the generator
      this.pat = util.reconcileValue(answers.pat, cmdLnInput.pat);
      this.tfs = util.reconcileValue(answers.tfs, cmdLnInput.tfs);
      this.profileCmd = util.reconcileValue(answers.profileCmd, cmdLnInput.profileCmd);
      this.tfsVersion = util.reconcileValue(answers.tfsVersion, cmdLnInput.tfsVersion);
      this.profileName = util.reconcileValue(answers.profileName, cmdLnInput.profileName);
   }.bind(this));
}

function processProfile() {
   let results = util.loadProfiles();

   switch (this.profileCmd) {
      case `list`:

         if (results.profiles !== null) {

            // Find longest string in each column
            let lengths = {
               Name: 0,
               URL: 0,
               Version: 0,
               Type: 0
            };

            results.profiles.forEach((p) => {
               if (lengths.Name < p.Name.length) {
                  lengths.Name = p.Name.length + 1;
               }

               if (lengths.URL < p.URL.length) {
                  lengths.URL = p.URL.length + 1;
               }

               if (lengths.Version < p.Version.length) {
                  lengths.Version = p.Version.length + 1;
               }

               if (lengths.Type < p.Type.length) {
                  lengths.Type = p.Type.length + 1;
               }
            });

            this.log(`${pad(`Name`, lengths.Name)}${pad(`URL`, lengths.URL)}${pad(`Version`, lengths.Version)}Type`);
            this.log(`${pad(`----`, lengths.Name)}${pad(`---`, lengths.URL)}${pad(`-------`, lengths.Version)}----`);

            results.profiles.forEach((p) => {
               this.log(`${pad(p.Name, lengths.Name)}${pad(p.URL, lengths.URL)}${pad(p.Version, lengths.Version)}${p.Type}`);
            });
         } else {
            this.log(`- ${results.error}`);
         }

         break;

      case `delete`:

         break;

      default:
         // Profiles store the full url not just the 
         // account name. Remember this is the same
         // format used by the VSTeam PowerShell module.
         if (util.isVSTS(this.tfs)) {
            this.tfsVersion = 'VSTS';
            this.tfs = `https://${this.tfs}.visualstudio.com`;
         }

         if (results.profiles === null) {
            results.profiles = [];
         }

         // See if this item is already in there
         // I am testing URL because the user may provide a different
         // name and I don't want two with the same URL.
         var tfsToFind = this.tfs;
         var found = results.profiles.filter(function (i) {
            return i.URL === tfsToFind;
         });

         if (found.length !== 0) {
            found[0].Name = this.profileName;
            found[0].URL = this.tfs;
            found[0].Pat = util.encodePat(this.pat);
            found[0].Type = `Pat`;
            found[0].Version = this.tfsVersion;
         } else {
            results.profiles.push({
               Name: this.profileName,
               URL: this.tfs,
               Pat: util.encodePat(this.pat),
               Type: `Pat`,
               Version: this.tfsVersion
            });
         }

         fs.writeFileSync(util.PROFILE_PATH, results.profiles);

         this.log(`+ Profile Added.`);
         break;
   }
}

module.exports = generators.Base.extend({
   // The name `constructor` is important here
   constructor: construct,

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting: input,

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring: processProfile
});