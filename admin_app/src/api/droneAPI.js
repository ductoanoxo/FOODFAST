import axios from './axios';

// Get all drones
export const getAllDrones = async (filters) => {
  const response = await axios.get('/drones', { params: filters });
  return response.data;
};

// Get drone by ID
export const getDroneById = async (droneId) => {
  const response = await axios.get(`/drones/${droneId}`);
  return response.data;
};

// Create drone
export const createDrone = async (droneData) => {
  const response = await axios.post('/drones', droneData);
  return response.data;
};

// Update drone
export const updateDrone = async (droneId, droneData) => {
  const response = await axios.put(`/drones/${droneId}`, droneData);
  return response.data;
};

// Delete drone
export const deleteDrone = async (droneId) => {
  const response = await axios.delete(`/drones/${droneId}`);
  return response.data;
};

// Update drone status
export const updateDroneStatus = async (droneId, status) => {
  const response = await axios.patch(`/drones/${droneId}/status`, { status });
  return response.data;
};
