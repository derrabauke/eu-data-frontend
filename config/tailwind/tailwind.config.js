'use strict';
// located in <app root>/config/tailwind/

const path = require('path');

const appRoot = path.join(__dirname, '../../');
const appEntry = path.join(appRoot, 'app');
const relevantFilesGlob = '**/*.{html,js,ts,hbs,gjs,gts}';

module.exports = {
  content: [path.join(appEntry, relevantFilesGlob)],
  plugins: [require('@tailwindcss/typography'), require('flowbite/plugin')],
  presets: [require('@crowdstrike/tailwind-toucan-base')],
  safelist: ['theme-dark', 'theme-light'],
  theme: {
    extend: {},
  },
};