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
      // Pass the cmdLnInput first. This will make sure any command line values
      // over ride any stored answers from previous runs. 
      this.pat = util.reconcileValue(cmdLnInput.pat, answers.pat);
      this.tfs = util.reconcileValue(cmdLnInput.tfs, answers.tfs);
      this.profileCmd = util.reconcileValue(cmdLnInput.profileCmd, answers.profileCmd);
      this.tfsVersion = util.reconcileValue(cmdLnInput.tfsVersion, answers.tfsVersion);
      this.profileName = util.reconcileValue(cmdLnInput.profileName, answers.profileName);
   }.bind(this));
}

function processProfile() {
   let results = util.loadProfiles();

   switch (this.profileCmd) {
      case `list`:

         if (results.profiles !== null) {

            // Find longest string in each column
            // Default to size of column headers + 1
            let lengths = {
               Name: 5,
               URL: 4,
               // This is longer than any possible value
               // plus one so we do not adjust it below.
               Version: 8,
               Type: 5
            };

            results.profiles.forEach((p) => {
               if (lengths.Name < p.Name.length) {
                  lengths.Name = p.Name.length + 1;
               }

               if (lengths.URL < p.URL.length) {
                  lengths.URL = p.URL.length + 1;
               }

               if (lengths.Type < p.Type.length) {
                  lengths.Type = p.Type.length + 1;
               }
            });

            this.log(`\r\n${pad(`Name`, lengths.Name)}${pad(`URL`, lengths.URL)}${pad(`Version`, lengths.Version)}Type`);
            this.log(`${pad(`----`, lengths.Name)}${pad(`---`, lengths.URL)}${pad(`-------`, lengths.Version)}----`);

            results.profiles.forEach((p) => {
               this.log(`${pad(p.Name, lengths.Name)}${pad(p.URL, lengths.URL)}${pad(p.Version, lengths.Version)}${p.Type}`);
            });

            this.log(`\r\n`);
         } else {
            this.log(`- ${results.error}`);
         }

         break;

      case `delete`:
         if (results.profiles === null) {
            results.profiles = [];
         }

         let nameToFind = this.profileName;
         let foundByName = results.profiles.filter(function (i) {
            return i.Name === nameToFind;
         });

         if (foundByName.length !== 0) {
            // Find and remove item from an array            
            results.profiles.splice(results.profiles.indexOf(foundByName[0]), 1);
         }

         fs.writeFileSync(util.PROFILE_PATH, JSON.stringify(results.profiles, null, 4));

         this.log(`+ Profile Delete.`);

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
         let tfsToFind = this.tfs;
         let foundByTfs = results.profiles.filter(function (i) {
            return i.URL === tfsToFind;
         });

         if (foundByTfs.length !== 0) {
            foundByTfs[0].Name = this.profileName;
            foundByTfs[0].URL = this.tfs;
            foundByTfs[0].Pat = util.encodePat(this.pat);
            foundByTfs[0].Type = `Pat`;
            foundByTfs[0].Version = this.tfsVersion;
         } else {
            results.profiles.push({
               Name: this.profileName,
               URL: this.tfs,
               Pat: util.encodePat(this.pat),
               Type: `Pat`,
               Version: this.tfsVersion
            });
         }

         fs.writeFileSync(util.PROFILE_PATH, JSON.stringify(results.profiles, null, 4));

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