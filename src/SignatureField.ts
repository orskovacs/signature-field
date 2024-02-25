import { html, css, LitElement } from 'lit';
import { query } from 'lit/decorators.js';

export class SignatureField extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--signature-field-text-color, #000);
    }

    canvas {
      touch-action: none;
      width: 100%;
      height: 100%;
    }
  `;

  @query('#canvas')
  canvas!: HTMLCanvasElement;

  get ctx(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }

  async onCanvasPointerMove(event: PointerEvent) {
    console.log(event.pressure);

    const strokeColor = '#000';
    const pointSize = 0.1 + event.pressure * 10;
    this.ctx.fillStyle = strokeColor;
    this.ctx.fillRect(event.pageX, event.pageY, pointSize, pointSize);

    const { ink } = navigator as any;
    const presenter = await ink.requestPresenter({
      presentationArea: this.canvas,
    });

    presenter.updateInkTrailStartPoint(event, {
      color: strokeColor,
      diameter: pointSize,
    });
  }

  render() {
    return html`
      <canvas
        id="canvas"
        width=${window.innerWidth}
        height=${window.innerHeight}
        @pointerdown=${this.onCanvasPointerMove}
        @pointermove=${this.onCanvasPointerMove}
      >
      </canvas>
    `;
  }
}
