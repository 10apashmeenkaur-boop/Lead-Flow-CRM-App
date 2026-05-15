const API_URL = "http://localhost:4000/leads";

export const fetchLeads = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const createLead = async (lead: any) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });
  return res.json();
};

export const updateLeadDetails = async (id: string, updates: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
};

export const deleteLead = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};