import jsPDF from "jspdf";

export function exportTextAsPdf(text, filename = "document.pdf", title = "") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;

  let y = 60;

  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, margin, y);
    y += 30;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(text, maxWidth);
  const lineHeight = 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  lines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = 60;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(filename);
}