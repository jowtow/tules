// Smoke test – verifies the Electron app starts up without errors.
// Run via:  electron test/smoke.js
'use strict';

const { app } = require('electron');

// If any uncaught exception occurs during startup, fail immediately.
process.on('uncaughtException', (err) => {
  console.error('Smoke test FAILED (uncaught exception):', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Smoke test FAILED (unhandled rejection):', reason);
  process.exit(1);
});

app.on('ready', () => {
  // Load the main module – this exercises Store initialisation, the Pomodoro
  // timer setup, IPC listener registration, keyboard shortcuts and the Tray.
  try {
    require('../main');
  } catch (err) {
    console.error('Smoke test FAILED: error loading main module:', err);
    process.exit(1);
  }

  // Give the app 8 seconds to finish async initialization, then exit cleanly.
  // Using app.exit() bypasses the normal quit flow so the process always ends.
  setTimeout(() => {
    console.log('Smoke test passed');
    app.exit(0);
  }, 8000);
});
