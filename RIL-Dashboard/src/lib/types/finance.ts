import type { Plant } from './order';

export type InvoiceStatus = 'Submitted' | 'Matched' | 'Approved' | 'Mismatch' | 'Rejected';

export type PaymentStatus = 'Pending' | 'Scheduled' | 'Released' | 'Paid' | 'Overdue';

export type ScfStatus = 'Eligible' | 'Discounted' | 'Not Eligible';

export interface Invoice {
  id: string;
  invoiceNo: string;
  vendor: string;
  orderId: string;
  plant: Plant;
  amountCr: number;
  dueDate: string;
  invoiceStatus: InvoiceStatus;
  paymentStatus: PaymentStatus;
  scfStatus: ScfStatus;
}

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  valueCr: number;
}
