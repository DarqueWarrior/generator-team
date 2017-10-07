const docker = require('./docker');

describe(`Azure Container Instances (Linux) using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `node`,
      appName: `nodeACITest`,
      target: `acilinux`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   });
});