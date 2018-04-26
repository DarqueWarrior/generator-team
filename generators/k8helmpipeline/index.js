module.exports = class extends Generator {
   
   constructor(args, opts) {
      // Calling the super constructor is important so our generator is correctly set up
      super(args, opts);
   }

   // 2. Where you prompt users for options (where you'd call this.prompt())
   prompting() {
      
   }

   // 5. Where you write the generator specific files (routes, controllers, etc)
   writing() {
      
   }

   // 7. Where installation are run (npm, bower)
   install() {
      
   }
};