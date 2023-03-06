/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      width: {
        '76': '19rem',
        '100': '30rem',
        '110': '34rem'
      },

      colors: {
        'light-grey' : '#f2f2f3',
        'mid-grey' : '#c6c6c6',
        'sec-bg': '#f7f6f9'
      },

      fontFamily: {
        poppins: "'Poppins', sans-serif",
      },

      fontWeight: {
        lighto : '200',
        normal: '400'
      },

      backgroundImage: {
        'location': "url('/images/map.png')",
        'warning-icon': "url('/images/assets/warning.png')"
      }
    }
  },
}
