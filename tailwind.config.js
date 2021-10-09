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
        'inventory': "url('/resources/images/inventory-sprite.png')",
        'footer-texture': "url('/resources/images/inventory-sprite.png')",
        'breadcrumb': "url('/resources/images/breadcrumb-background.png')",
      },
      backgroundPosition: {
        'guardian': '-110px -340px',
      },  
      width: {
        'avatar': '110px;',
        'inventory': '328px;'
      },
      height: {
        'avatar': '80px;',
        'inventory': '100px;'
      },
      inset: {
        'inventory-text': '103px',      
        'inventory-line1': '4px',
        'inventory-line2': '44px'
      },
      spacing: {
        'icon': '64px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
