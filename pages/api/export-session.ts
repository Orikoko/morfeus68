import type { NextApiRequest, NextApiResponse } from 'next';
import type { ExportRequest, ExportResponse } from '../../types/export';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function generatePDF(data: ExportRequest): string {
  const doc = new jsPDF();
  
  // Add watermark
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(14);
  doc.text('Morfeus Pro Terminal', 20, 20);

  // Add title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.text('Morfeus Session Recap', doc.internal.pageSize.width / 2, 40, { align: 'center' });
  
  // Add date and session info
  const firstEntry = data.grid[0];
  if (firstEntry) {
    const date = new Date(firstEntry.timestamp).toLocaleDateString();
    const session = firstEntry.label.charAt(0).toUpperCase() + firstEntry.label.slice(1);
    doc.setFontSize(16);
    doc.text(`${session} Session – ${date}`, doc.internal.pageSize.width / 2, 55, { align: 'center' });
  }

  // Add Grid Data Table
  doc.setFontSize(14);
  doc.text('Trading Analysis', 20, 75);
  
  const gridHeaders = [['Pair', 'Edge Score', 'Bias', 'Summary']];
  const gridRows = data.grid.map(item => [
    item.pair,
    `${item.edge_score}%`,
    item.label.toUpperCase(),
    item.summary
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: gridHeaders,
    body: gridRows,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 100 }
    }
  });

  // Add Chat History with timestamp formatting
  const startY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Session Chat Log', 20, startY);

  const chatRows = data.history.map(item => [
    new Date(item.timestamp).toLocaleTimeString(),
    item.type.toUpperCase(),
    item.message
  ]);

  if (chatRows.length > 0) {
    (doc as any).autoTable({
      startY: startY + 5,
      head: [['Time', 'Type', 'Message']],
      body: chatRows,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 130 }
      }
    });
  }

  // Add GPT Summary at the bottom
  const summaryY = chatRows.length > 0 
    ? (doc as any).lastAutoTable.finalY + 20 
    : startY + 20;

  doc.setFontSize(12);
  doc.setFontStyle('italic');
  doc.text('AI Analysis Summary:', 20, summaryY);
  
  const summary = data.grid[0]?.summary || 'No analysis available';
  const splitSummary = doc.splitTextToSize(summary, doc.internal.pageSize.width - 40);
  doc.text(splitSummary, 20, summaryY + 10);

  return doc.output('datauristring');
}

function generateMarkdown(data: ExportRequest): string {
  let markdown = '';
  
  // Add title and metadata
  const firstEntry = data.grid[0];
  if (firstEntry) {
    const date = new Date(firstEntry.timestamp).toLocaleDateString();
    const session = firstEntry.label.charAt(0).toUpperCase() + firstEntry.label.slice(1);
    markdown += `# ${session} Session – ${date}\n\n`;
  }

  // Add trading analysis
  markdown += '## Trading Analysis\n\n';
  markdown += '| Pair | Edge Score | Bias | Summary |\n';
  markdown += '|------|------------|------|----------|\n';
  
  data.grid.forEach(item => {
    markdown += `| ${item.pair} | ${item.edge_score}% | ${
      item.label.toUpperCase()} | ${item.summary} |\n`;
  });

  // Add top pairs section
  markdown += '\n## Top Performing Pairs\n\n';
  data.grid
    .sort((a, b) => b.edge_score - a.edge_score)
    .slice(0, 3)
    .forEach(item => {
      markdown += `- **${item.pair}** (Edge: ${item.edge_score}, Label: ${
        item.label.charAt(0).toUpperCase() + item.label.slice(1)})\n`;
    });

  // Add macro summary if available
  if (data.grid[0]?.summary) {
    markdown += '\n## Macro Analysis\n\n';
    markdown += `_${data.grid[0].summary}_\n`;
  }

  // Add chat history if available
  if (data.history.length > 0) {
    markdown += '\n## Session Chat Log\n\n';
    markdown += '| Time | Type | Message |\n';
    markdown += '|------|------|----------|\n';
    
    data.history.forEach(item => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      markdown += `| ${time} | ${item.type.toUpperCase()} | ${item.message} |\n`;
    });
  }

  // Add footer
  markdown += '\n---\n';
  markdown += '_Generated by Morfeus Pro Terminal_\n';

  return markdown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExportResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { grid, history, format } = req.body as ExportRequest;

    if (!grid || !history || !format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (format === 'pdf') {
      const pdfContent = generatePDF({ grid, history, format });
      return res.status(200).json({ url: pdfContent });
    } else if (format === 'markdown') {
      const markdownContent = generateMarkdown({ grid, history, format });
      return res.status(200).json({ content: markdownContent });
    } else {
      return res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (error) {
    console.error('Export Session Error:', error);
    return res.status(500).json({ error: 'Failed to generate export' });
  }
}