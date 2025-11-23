import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export async function generarWordAdaptado(texto, opciones, nombreArchivo) {
  const {
    fuente = "Arial",
    tamano = 28,
    colorFondo = "FFFFFF",
    espaciado = { line: 400 },
    negrita = false,
  } = opciones;

  const parrafos = texto.split("\n").map(
    (linea) =>
      new Paragraph({
        children: [
          new TextRun({
            text: linea,
            size: tamano,
            font: fuente,
            bold: negrita,
          }),
        ],
        spacing: espaciado,
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            background: colorFondo,
          }
        },
        children: parrafos,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${nombreArchivo}.docx`);
}
