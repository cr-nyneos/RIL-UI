import type { ContractType } from '../../lib/types/order';
import type { Milestone, Priority, Stakeholder, StakeholderRole, StepConfig, StepKey } from './types';

export const STEPS: StepConfig[] = [
  { key: 'details', label: 'Details' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'team', label: 'Team' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
];

export const VENDOR_OPTIONS = [
  { value: '', label: 'Select vendor' },
  { value: 'Larsen & Toubro', label: 'Larsen & Toubro' },
  { value: 'Kirloskar Brothers', label: 'Kirloskar Brothers' },
  { value: 'ISGEC Heavy Engineering', label: 'ISGEC Heavy Engineering' },
  { value: 'Bharat Heavy Electricals', label: 'Bharat Heavy Electricals' },
  { value: 'Thermax Ltd', label: 'Thermax Ltd' },
  { value: 'Supreme Petrochem', label: 'Supreme Petrochem' },
  { value: 'Praj Industries', label: 'Praj Industries' },
  { value: 'TEMA India', label: 'TEMA India' },
];

export const PLANT_OPTIONS = [
  { value: '', label: 'Select plant' },
  { value: 'Jamnagar', label: 'Jamnagar' },
  { value: 'Dahej', label: 'Dahej' },
  { value: 'Hazira', label: 'Hazira' },
  { value: 'Nagothane', label: 'Nagothane' },
  { value: 'Silvassa', label: 'Silvassa' },
];

export const CONTRACT_OPTIONS: Array<{ value: ContractType; label: ContractType }> = [
  { value: 'Manufactured', label: 'Manufactured' },
  { value: 'Material', label: 'Material' },
];

export const PRIORITY_OPTIONS: Array<{ value: Priority; label: Priority }> = [
  { value: 'Standard', label: 'Standard' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

export const WORKFLOWS: Record<ContractType, Milestone[]> = {
  Manufactured: [
    { label: 'Security Clearance', owner: 'Security Officer', durationDays: 2 },
    { label: 'Manufacturing', owner: 'Project Manager', durationDays: 14 },
    { label: 'Dispatch', owner: 'Site Engineer', durationDays: 3 },
    { label: 'Gate In', owner: 'Security Officer', durationDays: 1 },
    { label: 'QC', owner: 'QC Lead', durationDays: 4 },
    { label: 'Delivery', owner: 'Site Engineer', durationDays: 2 },
    { label: 'Governance', owner: 'Project Manager', durationDays: 3 },
    { label: 'Payment', owner: 'Finance Owner', durationDays: 5 },
  ],
  Material: [
    { label: 'Security Clearance', owner: 'Security Officer', durationDays: 1 },
    { label: 'Document Verification', owner: 'Project Manager', durationDays: 1 },
    { label: 'Dispatch', owner: 'Site Engineer', durationDays: 2 },
    { label: 'Gate In', owner: 'Security Officer', durationDays: 1 },
    { label: 'QC', owner: 'QC Lead', durationDays: 2 },
    { label: 'Delivery', owner: 'Site Engineer', durationDays: 1 },
    { label: 'Governance', owner: 'Project Manager', durationDays: 2 },
    { label: 'Payment', owner: 'Finance Owner', durationDays: 4 },
  ],
};

export const STAKEHOLDERS: Stakeholder[] = [
  { id: 'ananya-rao', name: 'Ananya Rao', role: 'Project Manager', plant: 'Jamnagar' },
  { id: 'rishabh-mehta', name: 'Rishabh Mehta', role: 'Site Engineer', plant: 'Dahej' },
  { id: 'devika-nair', name: 'Devika Nair', role: 'QC Lead', plant: 'Hazira' },
  { id: 'samar-shah', name: 'Samar Shah', role: 'Security Officer', plant: 'Nagothane' },
  { id: 'mira-kapoor', name: 'Mira Kapoor', role: 'Finance Owner', plant: 'Silvassa' },
  { id: 'kabir-sen', name: 'Kabir Sen', role: 'Project Manager', plant: 'Hazira' },
  { id: 'isha-menon', name: 'Isha Menon', role: 'QC Lead', plant: 'Jamnagar' },
  { id: 'vivaan-das', name: 'Vivaan Das', role: 'Security Officer', plant: 'Dahej' },
  { id: 'tara-iyer', name: 'Tara Iyer', role: 'Finance Owner', plant: 'Jamnagar' },
  { id: 'neel-suri', name: 'Neel Suri', role: 'Site Engineer', plant: 'Silvassa' },
];

export const ROLE_ORDER: StakeholderRole[] = [
  'Project Manager',
  'Site Engineer',
  'QC Lead',
  'Security Officer',
  'Finance Owner',
];

export const REQUIRED_DOCUMENTS = ['Contract', 'Specifications', 'Compliance Documents'];

export const STEP_COPY: Record<StepKey, { eyebrow: string; title: string; subtitle: string }> = {
  details: {
    eyebrow: 'Order',
    title: 'Commercial Details',
    subtitle: 'Core order values required before workflow generation.',
  },
  workflow: {
    eyebrow: 'Route',
    title: 'Workflow Preview',
    subtitle: 'Milestones adapt instantly to the selected contract type.',
  },
  team: {
    eyebrow: 'Owners',
    title: 'Role Assignment',
    subtitle: 'Assign accountable owners for each required role.',
  },
  documents: {
    eyebrow: 'Files',
    title: 'Document Package',
    subtitle: 'Upload mandatory files before final review.',
  },
  review: {
    eyebrow: 'Review',
    title: 'Final Order Review',
    subtitle: 'Read-only confirmation before creation.',
  },
};
