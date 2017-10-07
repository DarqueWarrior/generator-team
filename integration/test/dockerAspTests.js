const docker = require('./docker');

describe(`Docker Host using Default queue`, function () {
   "use strict";

   docker.runTests({
      appType: `asp`,
      appName: `aspDockerTest`,
      target: `docker`,
      queue: `Default`,
      groupId: ` `,
      title: `Home Page - My .NET Core Application`
   });
});