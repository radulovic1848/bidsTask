export const getCampaigns = async () => {
  const response = await fetch("http://localhost:5000/campaigns");
  return response.json();
};
