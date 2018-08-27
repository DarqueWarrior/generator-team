const appService = require('./_appService');

describe.only(`Azure App Service (Windows) using Default queue`, function () {
   "use strict";

   appService.runTests({
      appType: `asp`,
      appName: `aspPaaSTest`,
      target: `paas`,
      context: `Azure App Service (Windows)`,
      suffix: ``,
      queue: `Default`,
      title: `Home Page - My .NET Core Application`
   });
});