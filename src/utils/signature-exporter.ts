import { Signature } from '../models/signature.js';

export type SignatureExporter = (
  signatures: Signature[]
) => void | Promise<void>;

export const exportToJson: SignatureExporter = async signatures => {
  const data: string = JSON.stringify(
    signatures.map(s => ({
      creationTimeStamp: new Date(s.creationTimeStamp).toISOString(),
      dataPoints: s.dataPoints,
    }))
  );

  // eslint-disable-next-line no-undef
  let writableStream: FileSystemWritableFileStream | undefined;
  try {
    const newHandle = await window.showSaveFilePicker({
      types: [
        {
          description: 'JSON',
          accept: { 'text/json': ['.json'] },
        },
      ],
      suggestedName: `signatures_${Date.now()}`,
    });
    writableStream = await newHandle.createWritable();
    await writableStream?.write(data);
  } catch (error) {
    console.error(error);
  } finally {
    await writableStream?.close();
  }
};
