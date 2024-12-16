import { html, css, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ItemTemplate, repeat } from 'lit/directives/repeat.js';
import { SignatureDataPoint } from '../../models/signature-data-point.js';
import { Signature } from '../../models/signature.js';
import { exportToJson } from '../../utils/signature-exporter.js';

export class SignatureField extends LitElement {
  static styles = css`
    :host {
      display: inline-grid;
      grid-template-columns: min-content auto;
      grid-gap: 8px;

      color: var(--signature-field-text-color, #000);
      font-family: var(--signature-field-font-family, Arial);
      font-size: 14px;
    }

    canvas {
      touch-action: none;
      border: 1px solid black;
    }

    .button {
      --color: #008cba;
      --bg-color: #ffffff;
      --text-color: #000000;

      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      transition-property: color, background-color, border;
      transition-duration: 0.25s;
      cursor: pointer;

      background-color: var(--bg-color);
      color: var(--text-color);
      border: 2px solid var(--color);
    }

    .button.red {
      --color: #f44336;
    }

    .button:disabled {
      --color: #e7e7e7;
      --text-color: #e7e7e7;

      cursor: default;
    }

    .button:disabled:hover {
      background-color: var(--bg-color);
      color: var(--color);
    }

    .button:hover {
      background-color: var(--color);
      color: var(--bg-color);
    }

    .signature-list {
      display: grid;
      grid-gap: 8px;
      align-items: center;
      justify-content: start;
      justify-items: stretch;
      grid-template-columns: 200px 120px 120px;
      margin-top: 48px;

      grid-column: 1 / 3;
    }

    .signature-list .empty-list-indicator {
      grid-column: 1/4;
    }
  `;

  private static readonly strokeColor: '#000';

  @query('#canvas')
  private canvas!: HTMLCanvasElement;

  private isDrawing: boolean = false;

  @state()
  private signatures: Signature[] = [];

  @state()
  private _dataPoints: SignatureDataPoint[] = [];

  public get dataPoints(): SignatureDataPoint[] {
    return [...this._dataPoints];
  }

  private get context(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d')!;
  }

  @property({ type: String })
  public width: string = '400px';

  @property({ type: String })
  public height: string = '250px';

  @property({ type: Boolean })
  public noControls: boolean = false;

  render() {
    const signatureListItemTemplate: ItemTemplate<Signature> = s =>
      html`
        <span>${new Date(s.creationTimeStamp).toLocaleString()}</span>
        <button
          class="button red"
          type="button"
          @click=${() => this.deleteSignature(s)}
        >
          Delete
        </button>
        <button
          class="button"
          type="button"
          @click=${() => this.saveSignature(s)}
        >
          Save
        </button>
      `;

    const canvasTemplate = html`<canvas
      id="canvas"
      width=${this.width}
      height=${this.height}
      @pointerdown=${this.onPointerDown}
      @pointerup=${this.onPointerUp}
      @pointerrawupdate=${'onpointerrawupdate' in HTMLCanvasElement.prototype
        ? this.onPointerEvent
        : nothing}
      @pointermove=${!('onpointerrawupdate' in HTMLCanvasElement.prototype)
        ? this.onPointerEvent
        : nothing}
    >
    </canvas>`;

    if (this.noControls) {
      return canvasTemplate;
    }

    return html`
      ${canvasTemplate}
      <div class="field-controls">
        <button class="button" type="button" @click=${this.onClearClick}>
          Clear
        </button>
        <button
          class="button"
          type="button"
          ?disabled=${this._dataPoints.length === 0}
          @click=${this.onAddClick}
        >
          Add
        </button>
      </div>
      <div class="signature-list">
        <span>Signatures</span>
        <button
          class="button red"
          type="button"
          ?disabled=${this.signatures.length === 0}
          @click=${() => this.deleteAllSignatures()}
        >
          Delete all
        </button>
        <button
          class="button"
          type="button"
          ?disabled=${this.signatures.length === 0}
          @click=${() => this.saveAllSignatures()}
        >
          Save all
        </button>
        ${this.signatures.length === 0
          ? html`<div class="empty-list-indicator">
              No signature has been added to the list
            </div>`
          : ''}
        ${repeat(
          this.signatures,
          s => s.creationTimeStamp,
          signatureListItemTemplate
        )}
      </div>
    `;
  }

  private onPointerDown(event: PointerEvent): void {
    this.startDrawing(event);
  }

  private onPointerUp(): void {
    this.stopDrawing();
  }

  private onPointerEvent(event: PointerEvent): void {
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
    this.clear();
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
    if (
      !('altitudeAngle' in event && typeof event.altitudeAngle === 'number') ||
      !('azimuthAngle' in event && typeof event.azimuthAngle === 'number')
    ) {
      return;
    }

    const [xCoord, yCoord] = this.getCoordsFromEvent(event);

    const dataPoint: SignatureDataPoint = {
      timeStamp: event.timeStamp,
      pressure: event.pressure,
      xCoord,
      yCoord,
      altitudeAngle: event.altitudeAngle,
      azimuthAngle: event.azimuthAngle,
      height: event.height,
      twist: event.twist,
    };
    this._dataPoints = [...this._dataPoints, dataPoint];
  }

  private assembleDataPointsIntoSignature() {
    const signature = new Signature(this._dataPoints);
    this.signatures = [...this.signatures, signature];
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
    this._dataPoints = [];
  }

  private deleteSignature(signature: Signature): void {
    this.signatures = this.signatures.filter(s => s !== signature);
  }

  // eslint-disable-next-line class-methods-use-this
  private saveSignature(signature: Signature): void {
    exportToJson([signature]);
  }

  private saveAllSignatures(): void {
    exportToJson(this.signatures);
  }

  private deleteAllSignatures(): void {
    this.signatures = [];
  }

  public clear() {
    this.clearCanvas();
    this.clearDataPoints();
  }
}
