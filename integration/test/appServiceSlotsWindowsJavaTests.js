const appService = require('./appService');

describe(`Azure App Service Slots (Windows) using Default queue`, function () {
   "use strict";

   appService.runTests({
      appType: `java`,
      appName: `javaPaaSTest`,
      target: `paasslots`,
      context: `Azure App Service (Windows)`,
      groupId: `unitTest`,
      suffix: ``,
      queue: `Default`,
      title: `Home Page - My Spring Application`
   });
});