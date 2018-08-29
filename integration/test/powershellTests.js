const powershell = require('./_powershell');

describe(`PowerShell`, function () {
   describe(`PowerShell using Default queue`, function () {
      "use strict";

      powershell.runTests({
         appType: `powershell`,
         appName: `mymodule`,
         target: ``,
         context: `PowerShell`,
         suffix: ``,
         queue: `Default`
      });
   });
});