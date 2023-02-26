'use strict';
// located in <app root>/config/tailwind/

const path = require('path');

const appRoot = path.join(__dirname, '../../');
const appEntry = path.join(appRoot, 'app');
const relevantFilesGlob = '**/*.{html,js,ts,hbs,gjs,gts}';

module.exports = {
  content: [path.join(appEntry, relevantFilesGlob)],
  plugins: [require('@tailwindcss/typography'), require('flowbite/plugin')],
  safelist: [],
  theme: {
    extend: {
      boxShadow: {
        md: '-1px -1px 4px 1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
};
