# Changelog

## [2.0.0] – 2026-04-17

### Breaking changes
- **Electron 41**: upgraded from Electron 12 to Electron 41 (latest stable major).
- **electron-forge 7**: migrated from `@electron-forge ^6.0.0-beta` to stable `^7.11.1`.
- Removed `electron-packager` – all packaging is now handled exclusively via `electron-forge make`.
- The `package` and `package-prod` npm scripts have been removed; use `npm run make` instead.
- Dropped macOS ZIP target for Linux (was not relevant to project); kept macOS DMG + ZIP and Windows Squirrel.

### New features
- **macOS DMG release artifact** via `@electron-forge/maker-dmg`.
- **Windows Squirrel installer** via `@electron-forge/maker-squirrel`.
- `forge.config.js` introduced for explicit, version-controlled forge configuration.
- CI/CD pipeline updated: tag-triggered jobs (`refs/tags/v*`) now build native installers for both macOS (`macos-latest`) and Windows (`windows-latest`).
- `npm run make-mac` / `npm run make-win` convenience scripts added for local builds.

### Security & API modernisation
- **`contextIsolation: true`** and **`nodeIntegration: false`** are now explicit on every `BrowserWindow`.  `sandbox` is set to `false` on preload-bearing windows because preloads require third-party npm packages (`axios`, `moment`); this is documented in code comments.
- **`spotifyAuth.js`**: replaced deprecated `new Buffer()` constructor with `Buffer.from()`.  Removed legacy top-level `'node-integration'` / `'web-security'` options (they were never valid in `webPreferences`; moved correct equivalents inside `webPreferences`).
- **`features/store.js`**: removed `electron.remote` fallback – `remote` was removed in Electron 14.  `store.js` only runs in the main process so `app` is always available directly.
- **`features/pomodoro.js`**: replaced hard-coded absolute Windows path in toast XML (`C:/JohnsApps/...`) with a portable `path.join(__dirname, ...)` expression.
- **`features/preloadPomodoro.js`**: removed a dead `contextBridge.exposeInMainWorld("api", …)` block that was never consumed by any renderer page.

### Dependencies
- `axios` upgraded from `^0.21.1` to `^1.7.0`.
- `moment` unchanged at `^2.29.4`.

### CI
- `actions/checkout`, `actions/upload-artifact`, and `actions/setup-node` all updated to v4.
- `npm install` replaced with `npm ci` for reproducible installs.
- Node 20 pinned in CI.
