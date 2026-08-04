import { VENDORS } from './mockData/vendors';
import { VENDOR_PROFILES } from './mockData/vendorProfiles';
import type { Plant } from './types/order';
import type {
  Vendor,
  VendorCategory,
  VendorCertification,
  VendorProfile,
  VendorRisk,
} from './types/vendor';

export interface VendorOnboardingPayload {
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
  collected: number;
  total: number;
}

const createdVendors: Vendor[] = [];
const createdProfiles: Record<string, VendorProfile> = {};

const ONBOARDING_CERTIFICATIONS: VendorCertification[] = [
  { name: 'ISO 9001:2015', authority: 'BSI', validTo: '2028-03-31' },
  { name: 'Contractor Safety Licence', authority: 'RIL HSE', validTo: '2027-06-30' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function riskFor(compliance: number): VendorRisk {
  if (compliance >= 90) return 'Low';
  if (compliance >= 70) return 'Medium';
  return 'High';
}

export function nextVendorId(): string {
  const max = [...VENDORS, ...createdVendors].reduce((current, vendor) => {
    const value = Number(vendor.id.replace('VND-', ''));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 1020);

  return `VND-${max + 1}`;
}

export function getVendors(): Vendor[] {
  return [...createdVendors, ...VENDORS];
}

export function getVendorProfile(id: string): VendorProfile | undefined {
  return createdProfiles[id] ?? VENDOR_PROFILES[id];
}

export function createVendor(payload: VendorOnboardingPayload): Vendor {
  const id = nextVendorId();
  const compliance = payload.total === 0 ? 0 : Math.round((payload.collected / payload.total) * 100);
  const complete = payload.collected === payload.total;

  const vendor: Vendor = {
    id,
    name: payload.name.trim(),
    code: payload.code.trim().toUpperCase(),
    category: payload.category,
    plants: payload.plants,
    compliance,
    complianceState: complete ? 'Verified' : 'Pending KYC',
    risk: riskFor(compliance),
    status: 'Onboarding',
    lastActivity: today(),
  };

  createdProfiles[id] = {
    contactName: payload.contactName.trim(),
    contactRole: payload.contactRole,
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    city: payload.city.trim(),
    gstin: payload.gstin.trim().toUpperCase(),
    msme: payload.msme,
    onboardedAt: today(),
    kycVerifiedAt: complete ? today() : null,
    certifications: ONBOARDING_CERTIFICATIONS,
  };

  createdVendors.unshift(vendor);
  return vendor;
}
