import API from './axios'

// Get all drones
export const getAllDrones = async (params) => {
    const response = await API.get('/drones', { params })
    return response.data
}

// Get drone by ID
export const getDroneById = async (id) => {
    const response = await API.get(`/drones/${id}`)
    return response.data
}

// Create new drone
export const createDrone = async (droneData) => {
    const response = await API.post('/drones', droneData)
    return response.data
}

// Update drone
export const updateDrone = async (id, droneData) => {
    const response = await API.put(`/drones/${id}`, droneData)
    return response.data
}

// Delete drone
export const deleteDrone = async (id) => {
    const response = await API.delete(`/drones/${id}`)
    return response.data
}

// Update drone status
export const updateDroneStatus = async (id, status) => {
    const response = await API.patch(`/drones/${id}/status`, { status })
    return response.data
}

// Update drone location
export const updateDroneLocation = async (id, location) => {
    const response = await API.patch(`/drones/${id}/location`, location)
    return response.data
}

// Get drone statistics
export const getDroneStatistics = async () => {
    const response = await API.get('/drones/statistics')
    return response.data
}

// Assign mission to drone
export const assignMission = async (droneId, missionData) => {
    const response = await API.post(`/drones/${droneId}/missions`, missionData)
    return response.data
}

// Get drone mission history
export const getDroneMissions = async (droneId) => {
    const response = await API.get(`/drones/${droneId}/missions`)
    return response.data
}
