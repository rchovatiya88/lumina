export interface AffiliateClickPayload {
  product_id: string;
  product_name: string;
  store: string;
  price: number;
  destination_url: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  project_type?: string;
  budget?: string;
  subject?: string;
  message: string;
}

const backendBaseUrl =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.REACT_APP_BACKEND_URL) ||
  '';

const apiUrl = (path: string) => {
  if (!backendBaseUrl) return path;
  return `${backendBaseUrl.replace(/\/$/, '')}${path}`;
};

const postJson = async (path: string, payload: object) => {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export const trackAffiliateClick = async (payload: AffiliateClickPayload) => {
  return postJson('/api/affiliate-click', payload);
};

export const submitConsultationLead = async (payload: LeadPayload) => {
  return postJson('/api/leads/consultation', payload);
};

export const submitContactLead = async (payload: LeadPayload) => {
  return postJson('/api/leads/contact', payload);
};

export const fetchMonetizationMetrics = async () => {
  const response = await fetch(apiUrl('/api/monetization/metrics'));
  if (!response.ok) throw new Error(`Metrics request failed: ${response.status}`);
  return response.json();
};
