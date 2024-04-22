import '../../../../../../../dist/src/signature-field.js';

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/dialog/dialog.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/tabs/primary-tab.js';

import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
} from '@material/material-color-utilities';

function applyCustomTheme() {
  if (typescaleStyles.styleSheet)
    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

  const theme = themeFromSourceColor(argbFromHex('#f82506'), [
    {
      name: 'custom-1',
      value: argbFromHex('#ff0000'),
      blend: true,
    },
  ]);

  const systemDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');

  applyTheme(theme, { target: document.body, dark: systemDarkMedia.matches });

  systemDarkMedia.addEventListener('change', () => {
    applyTheme(theme, { target: document.body, dark: systemDarkMedia.matches });
  });
}

window.addEventListener('load', () => {
  applyCustomTheme();
});
