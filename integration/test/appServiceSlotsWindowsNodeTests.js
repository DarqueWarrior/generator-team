const appService = require('./_appService');

describe(`Azure App Service Slots (Windows) using Default queue`, function () {
   "use strict";

   appService.runTests({
      appType: `node`,
      appName: `nodePaaSTest`,
      target: `paasslots`,
      context: `Azure App Service (Windows)`,
      suffix: ``,
      queue: `Default`,
      title: `Home Page - My Express Application`
   });
});