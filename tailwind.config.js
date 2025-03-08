/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
       // 'primary': '#123456', // Custom primary color
      },
      spacing: {
        //'128': '32rem', // Custom spacing value
      },
      borderRadius: {
        //'4xl': '2rem', // Custom border radius
      },
    },
  },
  plugins: [
    // Add any plugins here
  ],
}