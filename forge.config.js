module.exports = {
  packagerConfig: {
    asar: true,
    // Unpack the notification icon so Windows toast XML can reference it
    // via a real file-system path even inside an ASAR-packaged app.
    asarUnpack: ['android-chrome-512x512.png'],
    icon: './favicon',
  },
  makers: [
    {
      // macOS: disk image
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'UDZO',
      },
    },
    {
      // macOS / Linux: zip archive (also used as a fallback)
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      // Windows: Squirrel installer
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'tules',
      },
    },
  ],
};
