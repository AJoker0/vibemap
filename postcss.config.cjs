const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

/*module.exports = {
  plugins: [
    tailwindcss(),
    autoprefixer()
  ]
}*/