// API Client for GeMStones Backend

const BASE_URL = '/api';

export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData 
      ? options.headers 
      : { ...defaultHeaders, ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Bidders
  getBidders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/bidders${query ? `?${query}` : ''}`);
  },
  getBidderStats: () => fetchApi('/bidders/stats/summary'),
  getBidderDetail: (id) => fetchApi(`/bidders/${id}`),
  createBidder: (data) => fetchApi('/bidders', { method: 'POST', body: JSON.stringify(data) }),
  submitOfficerDecision: (id, decisionData) => 
    fetchApi(`/bidders/${id}/decision`, { method: 'POST', body: JSON.stringify(decisionData) }),

  // Tenders
  getTenders: () => fetchApi('/tenders'),
  getTenderDetail: (id) => fetchApi(`/tenders/${id}`),

  // Verification
  runVerification: (bidderId, tenderId = null) => 
    fetchApi(`/verification/run/${bidderId}${tenderId ? `?tender_id=${tenderId}` : ''}`, { method: 'POST' }),
  runTenderVerification: (tenderId) => 
    fetchApi(`/verification/run-tender/${tenderId}`, { method: 'POST' }),
  runBatchVerification: () => 
    fetchApi('/verification/run-all', { method: 'POST' }),
  resetVerification: () => 
    fetchApi('/verification/reset', { method: 'POST' }),

  // Documents
  getDocuments: (bidderId) => 
    fetchApi(`/documents${bidderId ? `?bidder_id=${bidderId}` : ''}`),
  uploadDocument: (formData) => 
    fetchApi('/documents/upload', { method: 'POST', body: formData }),

  // Audit
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/audit${query ? `?${query}` : ''}`);
  },

  // Health
  checkHealth: () => fetchApi('/health'),
};
