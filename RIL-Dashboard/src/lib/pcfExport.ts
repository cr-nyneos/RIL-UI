import { formatCurrency, formatDate } from './format';
import type { PcfRecord } from './pcf';
import type { Order } from './types/order';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const NAVY = '0.09 0.15 0.33';
const SLATE = '0.39 0.45 0.55';
const BRAND = '0.21 0.36 0.96';
const BORDER = '0.86 0.90 0.97';
const HEADER_BG = '0.945 0.965 0.996';
const SUCCESS = '0.09 0.40 0.20';
const WARNING = '0.57 0.25 0.05';

interface PdfPage {
  ops: string[];
}

interface TextOptions {
  size?: number;
  bold?: boolean;
  color?: string;
  align?: 'left' | 'right';
}

function sanitize(value: string): string {
  return value
    .replace(/₹/g, 'INR ')
    .replace(/[–—]/g, '-')
    .replace(/·/g, '-')
    .replace(/[^\x20-\x7E]/g, '');
}

function escapeText(value: string): string {
  return sanitize(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function widthOf(value: string, size: number, bold: boolean): number {
  return sanitize(value).length * size * (bold ? 0.55 : 0.5);
}

function page(): PdfPage {
  return { ops: [] };
}

function text(target: PdfPage, x: number, y: number, value: string, options: TextOptions = {}) {
  const size = options.size ?? 10;
  const bold = options.bold ?? false;
  const color = options.color ?? NAVY;
  const left = options.align === 'right' ? x - widthOf(value, size, bold) : x;
  target.ops.push(
    `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${left.toFixed(2)} ${(PAGE_H - y).toFixed(2)} Td (${escapeText(value)}) Tj ET`,
  );
}

function rect(target: PdfPage, x: number, y: number, w: number, h: number, color: string) {
  target.ops.push(`${color} rg ${x.toFixed(2)} ${(PAGE_H - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
}

function rule(target: PdfPage, x: number, y: number, w: number, color = BORDER) {
  rect(target, x, y, w, 0.7, color);
}

function chrome(target: PdfPage, order: Order, heading: string, index: number, count: number) {
  rect(target, 0, 0, PAGE_W, 78, HEADER_BG);
  rect(target, 0, 78, PAGE_W, 1.6, BRAND);
  text(target, MARGIN, 34, 'NYNEOS VENDOR MANAGEMENT SYSTEM', { size: 8, bold: true, color: BRAND });
  text(target, MARGIN, 56, heading, { size: 16, bold: true });
  text(target, PAGE_W - MARGIN, 34, order.id, { size: 9, bold: true, color: SLATE, align: 'right' });
  text(target, PAGE_W - MARGIN, 56, order.vendor, { size: 11, color: SLATE, align: 'right' });

  rule(target, MARGIN, PAGE_H - 62, CONTENT_W);
  text(target, MARGIN, PAGE_H - 44, 'NyneOS Vendor Management System', { size: 8, color: SLATE });
  text(target, PAGE_W / 2 - 52, PAGE_H - 44, 'Project Completion File', { size: 8, color: SLATE });
  text(target, PAGE_W - MARGIN, PAGE_H - 44, `Page ${index} of ${count}`, { size: 8, color: SLATE, align: 'right' });
}

function fieldGrid(target: PdfPage, top: number, fields: { label: string; value: string }[]): number {
  const columnW = CONTENT_W / 2;
  let y = top;

  fields.forEach((field, index) => {
    const column = index % 2;
    const x = MARGIN + column * columnW;
    if (column === 0 && index > 0) y += 46;
    text(target, x, y, field.label.toUpperCase(), { size: 8, bold: true, color: SLATE });
    text(target, x, y + 17, field.value, { size: 11.5, bold: true });
  });

  return y + 46;
}

function tableHead(target: PdfPage, y: number, columns: { label: string; x: number }[]): number {
  rect(target, MARGIN, y - 13, CONTENT_W, 24, HEADER_BG);
  columns.forEach((column) => text(target, column.x, y + 3, column.label.toUpperCase(), { size: 8, bold: true, color: SLATE }));
  return y + 26;
}

function tableRow(
  target: PdfPage,
  y: number,
  cells: { value: string; x: number; bold?: boolean; color?: string; size?: number }[],
): number {
  cells.forEach((cell) => text(target, cell.x, y, cell.value, { size: cell.size ?? 10, bold: cell.bold, color: cell.color }));
  rule(target, MARGIN, y + 9, CONTENT_W);
  return y + 26;
}

function sectionTitle(target: PdfPage, y: number, title: string): number {
  text(target, MARGIN, y, title, { size: 12.5, bold: true });
  return y + 22;
}

function buildPdf(pages: PdfPage[]): Uint8Array {
  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 5 + index * 2);

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  pages.forEach((entry, index) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + index * 2} 0 R >>`,
    );
    const stream = entry.ops.join('\n');
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let file = '%PDF-1.4\n';
  const offsets: number[] = [];

  objects.forEach((body, index) => {
    offsets.push(file.length);
    file += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const startxref = file.length;
  file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    file += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  file += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return encodeLatin1(file);
}

function encodeLatin1(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function dateOf(value: string | null): string {
  return value ? formatDate(value) : '—';
}

function listRow(target: PdfPage, y: number, label: string, value: string, color = NAVY): number {
  text(target, MARGIN, y, label, { size: 10, color: SLATE });
  text(target, MARGIN + 250, y, value, { size: 10, bold: true, color });
  rule(target, MARGIN, y + 9, CONTENT_W);
  return y + 26;
}

function pcfPages(order: Order, record: PcfRecord): PdfPage[] {
  const pages = 5;

  const cover = page();
  chrome(cover, order, 'Project Completion File', 1, pages);
  text(cover, MARGIN, 108, 'Automatically generated from completed execution workflow milestones.', {
    size: 10,
    color: SLATE,
  });

  let y = fieldGrid(cover, 146, [
    { label: 'Order ID', value: order.id },
    { label: 'PO Number', value: order.po },
    { label: 'Vendor', value: order.vendor },
    { label: 'Plant', value: order.plant },
    { label: 'Contract Type', value: order.type },
    { label: 'Contract Value', value: formatCurrency(order.valueCr) },
    { label: 'Workflow Type', value: record.workflowType },
    { label: 'Workflow Version', value: record.workflowVersion },
    { label: 'PCF Version', value: record.pcfVersion },
    { label: 'Completion Status', value: record.status },
    { label: 'Award Date', value: formatDate(record.awardDate) },
    { label: 'Completion Date', value: dateOf(record.completionDate) },
  ]);

  rule(cover, MARGIN, y - 10, CONTENT_W);
  y = sectionTitle(cover, y + 20, 'Workflow Summary');
  y = listRow(cover, y, 'Workflow Stages Completed', `${record.stagesCompleted} / ${record.stagesTotal}`, record.stagesCompleted === record.stagesTotal ? SUCCESS : WARNING);
  y = listRow(cover, y, 'Approvals Completed', `${record.approvalsCompleted} / ${record.approvalsTotal}`);
  y = listRow(cover, y, 'Documents Collected', `${record.documents.length}`);
  y = listRow(cover, y, 'Deliveries Completed', `${record.deliveriesCompleted} / ${record.totalDeliveries}`);
  y = listRow(cover, y, 'Generated Automatically By', record.workflowEngine);

  const checklist = page();
  chrome(checklist, order, 'Completion Checklist', 2, pages);
  y = sectionTitle(checklist, 128, 'Artefacts attached as each workflow gate closed');
  y = tableHead(checklist, y, [
    { label: 'Item', x: MARGIN },
    { label: 'Completed By', x: MARGIN + 190 },
    { label: 'Completion Date', x: MARGIN + 330 },
    { label: 'Status', x: MARGIN + 440 },
  ]);
  record.checklist.forEach((item) => {
    y = tableRow(checklist, y, [
      { value: item.label, x: MARGIN, bold: true, size: 9.5 },
      { value: item.status === 'Complete' ? item.completedBy : '—', x: MARGIN + 190, color: SLATE, size: 9.5 },
      { value: dateOf(item.completedAt), x: MARGIN + 330, color: SLATE, size: 9.5 },
      {
        value: item.status,
        x: MARGIN + 440,
        size: 9.5,
        color: item.status === 'Complete' ? SUCCESS : WARNING,
      },
    ]);
  });

  const trace = page();
  chrome(trace, order, 'Workflow to Document Traceability', 3, pages);
  y = sectionTitle(trace, 128, 'Every artefact traced to the workflow stage that produced it');
  record.traceability.forEach((entry) => {
    text(trace, MARGIN, y, entry.stage, { size: 10.5, bold: true });
    y += 17;
    entry.documents.forEach((document) => {
      text(trace, MARGIN + 16, y, `-> ${document.name}`, { size: 10, color: SLATE });
      y += 16;
    });
    rule(trace, MARGIN, y - 1, CONTENT_W);
    y += 14;
  });

  const register = page();
  chrome(register, order, 'Document Register', 4, pages);
  y = sectionTitle(register, 128, `${record.documents.length} documents generated by the execution workflow`);
  y = tableHead(register, y, [
    { label: 'Document', x: MARGIN },
    { label: 'File', x: MARGIN + 155 },
    { label: 'Source Stage', x: MARGIN + 330 },
    { label: 'Status', x: MARGIN + 450 },
  ]);
  record.documents.forEach((document) => {
    y = tableRow(register, y, [
      { value: truncate(document.name, 28), x: MARGIN, bold: true, size: 9 },
      { value: truncate(document.file, 34), x: MARGIN + 155, color: SLATE, size: 9 },
      { value: document.stage, x: MARGIN + 330, color: SLATE, size: 9 },
      { value: 'Generated', x: MARGIN + 450, color: SUCCESS, size: 9 },
    ]);
  });

  const summary = page();
  chrome(summary, order, 'Project Summary', 5, pages);
  y = fieldGrid(summary, 132, [
    { label: 'Vendor', value: order.vendor },
    { label: 'Plant', value: order.plant },
    { label: 'Final Value', value: formatCurrency(order.valueCr) },
    { label: 'Total Workflow Duration', value: record.durationDays === null ? '—' : `${record.durationDays} days` },
    { label: 'Total Workflow Stages', value: `${record.stagesCompleted} / ${record.stagesTotal}` },
    { label: 'Total Approvals', value: `${record.approvalsCompleted} / ${record.approvalsTotal}` },
    { label: 'Total Artefacts', value: String(record.documents.length) },
    { label: 'Total Deliveries', value: `${record.deliveriesCompleted} / ${record.totalDeliveries}` },
    { label: 'PCF Generated On', value: dateOf(record.generatedAt) },
    { label: 'Generated By', value: record.workflowEngine },
  ]);

  rule(summary, MARGIN, y - 10, CONTENT_W);
  y = sectionTitle(summary, y + 20, 'Audit');
  y = listRow(summary, y, 'Workflow Engine', record.workflowEngine);
  y = listRow(summary, y, 'PCF Version', record.pcfVersion);
  y = listRow(summary, y, 'Workflow Version', record.workflowVersion);
  y = listRow(summary, y, 'Generated On', dateOf(record.generatedAt));
  y = listRow(summary, y, 'Generated By', 'System (Auto Generated)');

  return [cover, checklist, trace, register, summary];
}

function download(bytes: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadPcfPdf(order: Order, record: PcfRecord) {
  download(buildPdf(pcfPages(order, record)), `${order.id}_Project_Completion_File.pdf`, 'application/pdf');
}

