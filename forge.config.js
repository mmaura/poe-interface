module.exports = {
  packagerConfig: {
    icon: "src/renderer/assets/AppIcon.png",
    category: "Game",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "poe_interface",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "linux"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-flatpak",
      config: {
        options: {
          categories: ["Game"],
        },
      },
    },
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
              html: "./src/renderers/leveling/index.html",
              js: "./src/renderers/leveling/window.tsx",
              preload: {
                js: "./src/renderers/leveling/preload.ts",
              },
            },
            {
              name: "config_window",
              html: "./src/renderers/config/index.html",
              js: "./src/renderers/config/window.tsx",
              preload: {
                js: "./src/renderers/config/preload.ts",
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
