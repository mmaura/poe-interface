const colors = require('tailwindcss/colors')

module.exports = {
  mode:'fit',
  purge: [
    './src/**/*.{tsx, html}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      yellow: colors.amber,
      red: colors.red,
      poe: {
        1: '#a38d6d',
        2: '#ac9c5b',
        3: '#cec59f',
        4: '#dfcf99',
        50: '#00b6ff',
        96: '#302e2e',
        97: '#1a1b1b',
        98: '#181818',
        99: '#050505',
      }
    },
    extend: {
      backgroundImage: {
        'inventory': "url('/src/assets/images/inventory-sprite.png')",
        'footer-texture': "url('/src/assets/images/inventory-sprite.png')",
//        'breadcrumb': "url('/resources/images/breadcrumb-background.png')",
        'socket': "url('/src/assets/images/socket.png')",
      },
      backgroundPosition: {
        'guardian': '-110px -340px',
        'r': '-105px -35px',
        'g': '-105px 0px',
        'b': '-35px -70px',
        'w': '-105px -70px',
      },  
      width: {
        'avatar': '110px;',
        'inventory': '328px;',
      },
      height: {
        'avatar': '80px;',
        'inventory': '80px;'
      },
      inset: {
        'inventory-text': '103px',      
        'inventory-line1': '4px',
        'inventory-line2': '44px',
      },
      spacing: {
        'icon': '64px',
        'socket': '35px'

      },
      minHeight: {
        '200px': '200px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
