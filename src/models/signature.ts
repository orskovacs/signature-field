import { SignatureDataPoint } from './signature-data-point.js';

export class Signature {
  private _dataPoints: Map<SignatureDataPoint['timeStamp'], SignatureDataPoint>;

  constructor(dataPoints: SignatureDataPoint[]) {
    this._dataPoints = new Map(dataPoints.map(p => [p.timeStamp, p]));
  }

  public get dataPointsByTimestamp() {
    return new Map(this._dataPoints);
  }

  public get dataPoints(): SignatureDataPoint[] {
    return Array.from(this._dataPoints.values());
  }
}
