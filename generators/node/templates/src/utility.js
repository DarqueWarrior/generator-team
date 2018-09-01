var appInsights = require("applicationinsights");

// Used to wire up Application Insights
// Moving the code here makes it easier to mock.
function initAppInsights() {
   appInsights.setup().start();

   return appInsights.defaultClient;
}

module.exports = {
   initAppInsights: initAppInsights
};