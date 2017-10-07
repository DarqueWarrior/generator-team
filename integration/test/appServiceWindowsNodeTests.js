const appService = require('./appService');

describe(`Azure App Service (Windows) using Default queue`, function () {
   "use strict";
   var iterations = [{
      appType: `node`,
      appName: `nodePaaSTest`,
      target: `paas`,
      context: `Azure App Service (Windows)`,
      suffix: ``,
      queue: `Default`,
      title: `Home Page - My Express Application`
   }];

   iterations.forEach(appService.runTests);
});