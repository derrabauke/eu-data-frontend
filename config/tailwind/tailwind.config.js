'use strict';
// located in <app root>/config/tailwind/

const path = require('path');

const appRoot = path.join(__dirname, '../../');
const appEntry = path.join(appRoot, 'app');
const relevantFilesGlob = '**/*.{html,js,ts,hbs,gjs,gts}';

module.exports = {
  content: [
    path.join(appEntry, relevantFilesGlob),
    '../../node_modules/tw-elements/dist/js/**/*.js',
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('tw-elements/dist/plugin'),
  ],
  presets: [require('@crowdstrike/tailwind-toucan-base')],
  safelist: ['theme-dark', 'theme-light'],
  theme: {
    extend: {},
  },
};
