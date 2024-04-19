import '../../../../../../../dist/src/signature-field.js';

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
} from '@material/material-color-utilities';

if (typescaleStyles.styleSheet)
  document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

const theme = themeFromSourceColor(argbFromHex('#f82506'), [
  {
    name: 'custom-1',
    value: argbFromHex('#ff0000'),
    blend: true,
  },
]);
console.log(JSON.stringify(theme, null, 2));
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(theme, { target: document.body, dark: systemDark });
