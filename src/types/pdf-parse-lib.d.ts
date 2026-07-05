declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;

  export default pdfParse;
}
