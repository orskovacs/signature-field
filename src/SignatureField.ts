import { html, css, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { SignatureDataPoint } from './signature-data-point.js';
import { Signature } from './signature.js';

export class SignatureField extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--signature-field-text-color, #000);
    }

    canvas {
      touch-action: none;
      border: 1px solid red;
    }
  `;

  private static readonly strokeColor: '#000';

  @query('#canvas')
  private canvas!: HTMLCanvasElement;

  private isDrawing: boolean = false;

  private signatures: Signature[] = [];

  private dataPoints: SignatureDataPoint[] = [];

  private get context(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }

  render() {
    return html`
      <canvas
        id="canvas"
        width="1000px"
        height="700px"
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        @pointerrawupdate=${this.onPointerRawUpdate}
      >
      </canvas>
      <button @click=${this.onClearClick}>Clear</button>
      <button @click=${this.onAddClick}>Add</button>
    `;
  }

  private onPointerDown(event: PointerEvent): void {
    this.startDrawing(event);
  }

  private onPointerUp(): void {
    this.stopDrawing();
  }

  private onPointerRawUpdate(event: PointerEvent): void {
    /* https://w3c.github.io/pointerevents/#dfn-coalesced-events
      The parent event is an aggregation of the coalesced events,
      so either the parent events or all of the coalesced events
      need to be processed, but not both.
     */

    for (const e of event.getCoalescedEvents()) {
      this.drawFromPointerEvent(e);
      this.createNewDataPoint(e);
    }
  }

  private onClearClick() {
    this.clearCanvas();
    this.clearDataPoints();
  }

  private onAddClick() {
    this.assembleDataPointsIntoSignature();
    this.clearCanvas();
    this.clearDataPoints();
  }

  private startDrawing(event: PointerEvent): void {
    this.isDrawing = true;

    this.context.fillStyle = SignatureField.strokeColor;
    this.context.lineCap = 'round';

    this.context.beginPath();
    this.context.moveTo(...this.getCoordsFromEvent(event));
  }

  private stopDrawing() {
    this.isDrawing = false;
  }

  private drawFromPointerEvent(event: PointerEvent) {
    const pointSize = 0.1 + event.pressure * 7;

    if (!this.isDrawing) {
      return;
    }

    const [x, y] = this.getCoordsFromEvent(event);

    this.context.lineWidth = pointSize;

    this.context.lineTo(x, y);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(x, y);

    // const { ink } = navigator;

    // if (ink === undefined) {
    //   console.log('Ink is not supported by Navigator');
    //   return;
    // }

    // const presenter = await ink.requestPresenter({
    //   presentationArea: this.canvas,
    // });

    // if (presenter.expectedImprovement === 0) {
    //   console.log(
    //     `Expected improvement from Ink is ${presenter.expectedImprovement}ms`
    //   );
    //   return;
    // }

    // presenter.updateInkTrailStartPoint(event, {
    //   color: '#000',
    //   diameter: pointSize,
    // });
  }

  private createNewDataPoint(event: PointerEvent) {
    const dataPoint: SignatureDataPoint = {
      timeStamp: event.timeStamp,
      pressure: event.pressure,
      xCoord: event.x,
      yCoord: event.y,
    };
    this.dataPoints.push(dataPoint);
  }

  private assembleDataPointsIntoSignature() {
    const signature = new Signature(this.dataPoints);
    this.signatures.push(signature);
  }

  private getCoordsFromEvent(event: PointerEvent): [x: number, y: number] {
    const x = event.pageX - this.canvas.offsetLeft;
    const y = event.pageY - this.canvas.offsetTop;

    return [x, y];
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private clearDataPoints(): void {
    this.dataPoints = [];
  }
}
