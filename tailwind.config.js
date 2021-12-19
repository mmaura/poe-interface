const colors = require("tailwindcss/colors")

module.exports = {
  mode: "fit",
  purge: ["./src/**/*.{tsx, html}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      yellow: colors.amber,
      red: colors.red,
      // green: colors.green,
      poe: {
        1: "#a38d6d",
        2: "#ac9c5b",
        3: "#cec59f",
        4: "#dfcf99",
        50: "#00b6ff",
        96: "#302e2e",
        97: "#1a1b1b",
        98: "#181818",
        99: "#050505",
        60: "#00FF00",
      },
    },
    extend: {
      backgroundImage: {
        inventory: "url('/src/assets/images/inventory-sprite.png')",
        // 'footer-texture': "url('/src/assets/images/inventory-sprite.png')",
        socket: "url('/src/assets/images/socket.png')",
      },
      backgroundPosition: {
        ascendant: "0px -180px",
        deadeye: "0px -260px",
        gladiator: "0px -340px",
        pathfinder: "0px -420px",

        assassin: "-110px -180px",
        duelist: "-110px -260px",
        guardian: "-110px -340px",
        raider: "-110px -420px",

        elementalist: "-220px -260px",
        hierophant: "-220px -340px",
        ranger: "-220px -420px",

        berserker: "-328px 0px",
        champion: "-328px -80px",
        chieftain: "-328px -160px",
        saboteur: "-328px -420px",

        inquisitor: "-438px 0px",
        juggernaut: "-438px -80px",
        marauder: "-438px -160px",
        necromancer: "-438px -240px",
        occultist: "-438px -320px",

        scion: "-548px 0px",
        shadow: "-548px -80px",
        slayer: "-548px -160px",
        templar: "-548px -240px",
        trickster: "-548px -320px",
        witch: "-548px -400px",

        skred: "-105px -35px",
        skgreen: "-105px 0px",
        skblue: "-35px -70px",
        skwhite: "-105px -70px",
      },
      width: {
        avatar: "110px;",
        inventory: "300px;",
        "gear-container": "790px",
        "gear-container-onedit": "680px",
        "notes-container": "580px",
        "guide-container": "400px",
        "gear": "175px",
        "gem-list-element": "260px",
      },
      height: {
        "avatar": "80px;",
        "inventory": "80px;",
        "gear-edit": "195px",
        "gear": "150px",
        "gem-list": "520px",
      },
      minHeight: {
        "map-container": "110px",
        "note-container": "300px",
        "gem-list-element": "96px",
      },
      minWidth: {
        "gem-list-element": "260px",
      },
      maxHeight: {
        "gem-list": "520px",
        "gem-list-element": "96px",
      },
      inset: {
        "inventory-text": "103px",
        "inventory-line1": "4px",
        "inventory-line2": "44px",
        "gem-list-element": "260px",
      },
      spacing: {
        icon: "32px",
        socket: "35px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
