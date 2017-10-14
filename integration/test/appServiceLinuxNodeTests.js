const appService = require('./_appService');

describe(`Default Node AS Docker`, function () {
   describe(`Azure App Service Docker (Linux) using Default queue`, function () {
      "use strict";

      appService.runTests({
         appType: `node`,
         appName: `nodeDockerPaaSTest`,
         target: `dockerpaas`,
         context: `Azure App Service Docker (Linux)`,
         suffix: `-Docker`,
         queue: `Default`,
         title: `Home Page - My Express Application`
      });
   });
});