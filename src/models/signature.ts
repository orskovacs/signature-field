import { SignatureDataPoint } from './signature-data-point.js';

export class Signature {
  private _dataPoints: Map<SignatureDataPoint['timeStamp'], SignatureDataPoint>;

  private _creationTimeStamp: number;

  constructor(dataPoints: SignatureDataPoint[]) {
    this._dataPoints = new Map(dataPoints.map(p => [p.timeStamp, p]));
    this._creationTimeStamp = Date.now();
  }

  public get dataPointsBytimeStamp() {
    return new Map(this._dataPoints);
  }

  public get dataPoints(): SignatureDataPoint[] {
    return Array.from(this._dataPoints.values());
  }

  public get creationTimeStamp(): number {
    return this._creationTimeStamp;
  }
}
