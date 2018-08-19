# Integration Tests

To run integration test on your dev machine you must create a .env file with the following values.

```env
LOG=off
DO_NOT_CLEAN_UP=false

ACCT=
PAT=

AZURE_SUB=
AZURE_SUB_ID=
AZURE_TENANT_ID=
SERVICE_PRINCIPAL_ID=
SERVICE_PRINCIPAL_KEY=

# Change this value if not running from the integration folder.
LEVELS_UP="/./"

AZURE_SECRET=
AZURE_CLIENT_ID=

DOCKER_REGISTRY_USERNAME=
DOCKER_REGISTRY=
DOCKER_HOST=
DOCKER_CERT_PATH=
DOCKER_REGISTRY_PASSWORD=
DOCKER_PORTS="80 "
```

When setting the port you have to use a space after the value or it will be parsed as a
number instead of a string and will not work.

```env
DOCKER_PORTS="80 "
```

This is an example calling from the integration folder.

```PowerShell
node ..\node_modules\mocha\bin\mocha --opts .\test\mocha.opts .\test\dockerACILinuxAgentAspTests.js
```

When running the dockerXXXLinux test you need to comment out the following lines because the Linux agents have docker tools on them and you do not need to provide a host.

```env
#DOCKER_HOST=
#DOCKER_CERT_PATH=
```

The test require this to know which account to use and how to auth.

During CI/CD make sure the test machine has these environment vars set before running test.

mocha.opts sets the timeout for the integration test which take much longer than unit tests.