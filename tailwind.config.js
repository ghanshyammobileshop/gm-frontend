/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts,css,scss,sass,less,styl}',
  ],
  theme: {
    extend: {
      backgroundColor:{
        default:'#0052CF',
        primary: '#0052CF',
        warn: 'red',
        secondary:'#909090',
        accent:'#000000'
      },
      colors: {
        primary: '#0052CF',
        secondary: '#909090',
        hint:'#000000de',
        default:'#000000',
        white:'#ffffff',
        accent:'#000000'
      },
      textColor: {
        default:'#000000',
        primary: '#0052CF',
        warn: 'red',
        secondary:'#909090',
        hint:'#5D5D5D',
        'on-primary': '#ffffff',
        'on-accent': '#ffffff',
        'on-warn': '#ffffff',
        'on-secondary':'#ffffff',
        accent:'#000000'
      },
      borderColor: {
        default:'#CDD5E0',
        primary: '#0052CF',
        warn: 'red',
        secondary:'#909090',
        accent:'#000000',
      }
    },
  },
  plugins: [],
}