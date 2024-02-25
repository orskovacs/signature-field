import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { SignatureField } from '../src/SignatureField.js';
import '../src/signature-field.js';

describe('SignatureField', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<SignatureField>(
      html`<signature-field></signature-field>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
