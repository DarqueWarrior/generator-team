To run integration test on your dev machine you must create a .env file with two values (PAT and ACCT) for example.

PAT=wefkz4tdzpl37mu2pkyxfoblolly3w66klyjmwakdqupbh4za
ACCT=myVSTSAccountNameOnly

DOCKER_HOST=tcp://my2016docker.westus.cloudapp.azure.com:2376
DOCKER_REGISTRY=https://mydockerimage-microsoft.azurecr.io
DOCKER_REGISTRY_USERNAME=mydockerimage

The test require this to know which account to use and how to auth.

During CI/CD make sure the test machine has these environment vars set before running test.

mocha.opts sets the timeout for the integration test which take much longer than unit tests.