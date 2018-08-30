const fs = require('fs');
const os = require('os');
const pad = require('pad');
const path = require(`path`);
const util = require(`../app/utility`);
const argUtils = require(`../app/args`);
const prompts = require(`../app/prompt`);
const Generator = require(`yeoman-generator`);

module.exports = class extends Generator {
   // The name `constructor` is important here
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);

      // Order is important 
      argUtils.profileCmd(this);
      argUtils.profileName(this);
      argUtils.tfs(this);
      argUtils.pat(this);
      argUtils.tfsVersion(this);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
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
         this.pat = util.reconcileValue(cmdLnInput.options.pat, answers.pat);
         this.tfs = util.reconcileValue(cmdLnInput.options.tfs, answers.tfs);
         this.profileCmd = util.reconcileValue(cmdLnInput.options.profileCmd, answers.profileCmd);
         this.tfsVersion = util.reconcileValue(cmdLnInput.options.tfsVersion, answers.tfsVersion);
         this.profileName = util.reconcileValue(cmdLnInput.options.profileName, answers.profileName);
      }.bind(this));
   }

   // 3. Saving configurations and configure the project (creating .editorconfig files and other metadata files)
   configuring() {
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

            // Find and remove item from an array
            let index = results.profiles.findIndex(p=> p.Name.toLowerCase() === this.profileName.toLowerCase());
            if (index !== -1) {
               results.profiles.splice(index, 1);
            }

            fs.writeFileSync(util.PROFILE_PATH, JSON.stringify(results.profiles, null, 4));

            this.log.ok(`Profile Deleted.`);

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
               return i.URL.toLowerCase() === tfsToFind.toLowerCase();
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

            this.log.ok(`Profile Added.`);

            break;
      }
   }
};