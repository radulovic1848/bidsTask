export const getNewBids = async () => {
  const response = await fetch("http://localhost:5000/bids/");
  return response.json();
};
