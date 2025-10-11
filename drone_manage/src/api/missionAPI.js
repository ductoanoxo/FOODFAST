import API from './axios'

// Get all missions
export const getAllMissions = async (params) => {
    const response = await API.get('/missions', { params })
    return response.data
}

// Get mission by ID
export const getMissionById = async (id) => {
    const response = await API.get(`/missions/${id}`)
    return response.data
}

// Create mission
export const createMission = async (missionData) => {
    const response = await API.post('/missions', missionData)
    return response.data
}

// Update mission
export const updateMission = async (id, missionData) => {
    const response = await API.put(`/missions/${id}`, missionData)
    return response.data
}

// Cancel mission
export const cancelMission = async (id) => {
    const response = await API.patch(`/missions/${id}/cancel`)
    return response.data
}

// Complete mission
export const completeMission = async (id) => {
    const response = await API.patch(`/missions/${id}/complete`)
    return response.data
}

// Get mission statistics
export const getMissionStatistics = async () => {
    const response = await API.get('/missions/statistics')
    return response.data
}
