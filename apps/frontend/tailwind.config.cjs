/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bloom: {
          rose: '#c45c7a',
          cream: '#fbf6f0',
          leaf: '#3d6b4f',
        },
      },
    },
  },
  plugins: [],
};
