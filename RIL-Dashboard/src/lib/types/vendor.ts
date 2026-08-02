import type { Plant } from './order';

export type VendorStatus = 'Active' | 'Onboarding' | 'Inactive' | 'Suspended';

export type VendorRisk = 'Low' | 'Medium' | 'High';

export type VendorCompliance = 'Verified' | 'Pending KYC' | 'Expiring' | 'Expired';

export type VendorCategory =
  | 'Rotating Equipment'
  | 'Static Equipment'
  | 'Heat Exchangers'
  | 'Bulk Chemicals'
  | 'Catalysts'
  | 'Electricals'
  | 'Instrumentation'
  | 'Civil & Structural'
  | 'Packaging'
  | 'Logistics';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: VendorCategory;
  plants: Plant[];
  /** Document + KYC completeness, 0-100. */
  compliance: number;
  complianceState: VendorCompliance;
  risk: VendorRisk;
  status: VendorStatus;
  /** ISO date of the last order, movement or document event. */
  lastActivity: string;
}

export interface VendorCertification {
  name: string;
  authority: string;
  /** ISO date. */
  validTo: string;
}

/** The registration and contact record behind a directory row — Vendor 360. */
export interface VendorProfile {
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  msme: boolean;
  /** ISO date the vendor was onboarded. */
  onboardedAt: string;
  /** ISO date of the last KYC verification, null when never verified. */
  kycVerifiedAt: string | null;
  certifications: VendorCertification[];
}
