const appService = require('./_appService');

describe(`Default Java AS Docker`, function () {
   describe(`Azure App Service Docker (Linux) using Default queue`, function () {
      "use strict";
      
      appService.runTests({
         appType: `java`,
         appName: `javaDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         groupId: `unitTest`,
         suffix: `-Docker`,
         queue: `Default`,
         title: `Home Page - My Spring Application`
      });
   });
});