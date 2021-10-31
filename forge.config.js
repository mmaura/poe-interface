module.exports = {
  packagerConfig: {
    icon: "src/assets/AppIcon.png",
    category: "Game",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "poe_interface",
      },
      platforms: ["win32"],
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "linux", "win32"],
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
    },
    // {
    //   name: "@electron-forge/maker-deb",
    //   config: {},
    // },
    // {
    //   name: "@electron-forge/maker-rpm",
    //   config: {},
    // },
    // {
    //   name: "@electron-forge/maker-flatpak",
    //   config: {
    //     options: {
    //       categories: ["Game"],
    //     },
    //   },
    // },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              name: "leveling_window",
              html: "./src/renderers/index.html",
              js: "./src/renderers/leveling/LevelingRenderer.tsx",
              preload: {
                js: "./src/renderers/preload.ts",
              },
            },
            {
              name: "config_window",
              html: "./src/renderers/index.html",
              js: "./src/renderers/config/ConfigRenderer.tsx",
              preload: {
                js: "./src/renderers/preload.ts",
              },
            },
          ],
        },
      },
    ],
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      platforms: ["linux"],
      config: {
        repository: {
          owner: "mmaura",
          name: "poe-interface",
        },
        prerelease: true,
      },
    },
  ],
};
