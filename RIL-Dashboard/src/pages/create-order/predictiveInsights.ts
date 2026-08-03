export interface PredictiveInsight {
  key: string;
  title: string;
  body: string;
}

const VENDOR_INSIGHTS: Record<string, string> = {
  'Tata Projects': 'This vendor usually takes 3–5 extra days at Security Clearance.',
  'Siemens Energy India': 'This vendor often sees QC delays. Plan 2 extra working days.',
  'Flowserve India': 'This vendor has a higher damaged item rate. Schedule an early inspection.',
  'Kirloskar Brothers': 'This vendor often sends incomplete documents. Expect a 1 day delay.',
  'Bharat Heavy Electricals': 'This vendor usually dispatches 1–2 days late.',
  'TEMA India': 'Inspections for this vendor usually take 2 extra days.',
};

const PLANT_INSIGHTS: Record<string, string> = {
  Jamnagar: 'Gate Entry at Jamnagar is usually slow. Expect a 1–2 day delay.',
  Nagpur: 'QC at Nagpur normally takes longer than planned.',
  Surat: 'Unloading at Surat is often delayed during peak weeks.',
};

export function getVendorInsight(vendor: string): PredictiveInsight | null {
  const body = VENDOR_INSIGHTS[vendor];
  if (!body) return null;
  return { key: `vendor:${vendor}`, title: 'Vendor Insight', body };
}

export function getPlantInsight(plant: string): PredictiveInsight | null {
  const body = PLANT_INSIGHTS[plant];
  if (!body) return null;
  return { key: `plant:${plant}`, title: 'Plant Insight', body };
}
