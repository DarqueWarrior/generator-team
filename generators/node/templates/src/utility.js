var appInsights = require("applicationinsights");

// Used to wire up Application Insights
// Moving the code here makes it easier to mock.
function initAppInsights() {
   // If the user does not set the key just skip setup
   if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
      appInsights.setup().start();

   return appInsights.defaultClient;
}

module.exports = {
   initAppInsights: initAppInsights
};