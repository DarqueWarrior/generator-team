const appService = require('./_appService');

describe(`Default Java AS`, function () {
   describe(`Azure App Service (Windows) using Default queue`, function () {
      "use strict";

      appService.runTests({
         appType: `java`,
         appName: `javaPaaSTest`,
         target: `paas`,
         context: `Azure App Service (Windows)`,
         groupId: `unitTest`,
         suffix: ``,
         queue: `Default`,
         title: `Home Page - My Spring Application`
      });
   });
});