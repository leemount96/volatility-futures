import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const WhitepaperComponent = () => {
  return (
    <div>
      <Document file={require("../assets/Volatility_Futures_White_Paper.pdf")}>
        <Page pageNumber={1} />
        <Page pageNumber={2} />
        <Page pageNumber={3} />
      </Document>
    </div>
  );
};
