const appService = require('./appService');

describe(`Azure App Service Slots (Windows) using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `asp`,
      appName: `aspPaaSTest`,
      target: `paasslots`,
      context: `Azure App Service (Windows)`,
      suffix: ``,
      queue: `Default`,
      title: `Home Page - My .NET Core Application`
   }];

   iterations.forEach(appService.runTests);
});