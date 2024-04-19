import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { SignatureField } from '../src/elements/signature-field/SignatureField.js';
import '../src/elements/signature-field/signature-field.js';

describe('SignatureField', () => {
  it('passes the a11y audit', async () => {
    const signatureField = await fixture<SignatureField>(
      html`<signature-field />`
    );

    await expect(signatureField).shadowDom.to.be.accessible();
  });

  it('sets the size of the inner canvas correctly', async () => {
    const widthPx = 100;
    const heightPx = 50;

    const signatureField = await fixture<SignatureField>(
      html`<signature-field width="${widthPx}px" height="${heightPx}px" />`
    );

    const innerCanvas = signatureField.shadowRoot?.querySelector('canvas');

    await expect(innerCanvas).property('width').equals(widthPx);
    await expect(innerCanvas).property('height').equals(heightPx);
  });
});
