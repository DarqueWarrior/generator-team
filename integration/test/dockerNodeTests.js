const docker = require('./docker');

describe(`Docker Host using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `node`,
      appName: `nodeDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My Express Application`
   });
});