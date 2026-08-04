import type { Plant } from '../../lib/types/order';
import type { VendorCategory } from '../../lib/types/vendor';

export type OnboardStepKey = 'company' | 'kyc' | 'documents' | 'review';

export interface VendorDraft {
  name: string;
  code: string;
  category: VendorCategory;
  plants: Plant[];
  city: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  gstin: string;
  msme: boolean;
  documents: Record<string, boolean>;
}

export interface KycDocument {
  name: string;
  required: boolean;
}

export const ONBOARD_STEPS: { key: OnboardStepKey; label: string }[] = [
  { key: 'company', label: 'Company' },
  { key: 'kyc', label: 'KYC & Contact' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
];

/* The five required names match the Document Verification gate checklist in
   GateWorkspace, so onboarding and the execution gate ask for the same files. */
export const KYC_DOCUMENTS: KycDocument[] = [
  { name: 'GST Certificate', required: true },
  { name: 'PAN Card', required: true },
  { name: 'Bank Details', required: true },
  { name: 'Safety Certificate', required: true },
  { name: 'Insurance Certificate', required: true },
  { name: 'Labour License', required: false },
  { name: 'MSME Certificate', required: false },
  { name: 'ISO 9001', required: false },
];

export const CONTACT_ROLES = [
  'Key Account Manager',
  'Business Manager',
  'Regional Sales Head',
  'Cluster Project Manager',
  'Commercial Lead',
];

export function createDummyDraft(): VendorDraft {
  return {
    name: 'Godrej Process Equipment',
    code: 'GPE-IN',
    category: 'Static Equipment',
    plants: ['Jamnagar', 'Surat'],
    city: 'Mumbai',
    contactName: 'Rohan Bhatt',
    contactRole: 'Key Account Manager',
    email: 'rohan.bhatt@godrejpe.example',
    phone: '+91 98201 44870',
    gstin: '27AAACG1234H1Z6',
    msme: true,
    documents: Object.fromEntries(
      KYC_DOCUMENTS.map((document, index) => [document.name, index < 3]),
    ),
  };
}
