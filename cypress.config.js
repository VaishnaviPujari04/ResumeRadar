const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // 1. Paste your exact local server URL here:
    baseUrl: 'http://localhost:5173', 
    
    // 2. This helper fixes routing issues for single-page apps
    video: false, 
    screenshotOnRunFailure: false
  },
});