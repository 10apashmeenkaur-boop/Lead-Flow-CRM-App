const API_URL = 'http://localhost:4000/leads';

export const fetchLeads = async (search = "", status = "ALL") => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch leads");
  let data = await response.json();

  if (search) {
    const lowerSearch = search.toLowerCase();
    data = data.filter((lead: any) => 
      lead.name.toLowerCase().includes(lowerSearch) || 
      lead.email.toLowerCase().includes(lowerSearch)
    );
  }
  if (status !== "ALL") {
    data = data.filter((lead: any) => lead.status === status);
  }
  return data;
};

export const createLead = async (leadData: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!response.ok) throw new Error("Failed to create lead");
  return response.json();
};

export const updateLeadDetails = async (id: string, leadData: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!response.ok) throw new Error("Failed to update lead details");
  return response.json();
};

export const deleteLead = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error("Failed to delete lead");
};