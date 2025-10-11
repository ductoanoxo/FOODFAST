import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    drones: [],
    selectedDrone: null,
    loading: false,
    error: null,
}

const droneSlice = createSlice({
    name: 'drone',
    initialState,
    reducers: {
        setDrones: (state, action) => {
            state.drones = action.payload
            state.loading = false
        },
        addDrone: (state, action) => {
            state.drones.unshift(action.payload)
        },
        updateDrone: (state, action) => {
            const index = state.drones.findIndex(d => d._id === action.payload._id)
            if (index !== -1) {
                state.drones[index] = action.payload
            }
        },
        removeDrone: (state, action) => {
            state.drones = state.drones.filter(d => d._id !== action.payload)
        },
        updateDroneLocation: (state, action) => {
            const { droneId, location } = action.payload
            const drone = state.drones.find(d => d._id === droneId)
            if (drone) {
                drone.currentLocation = location
            }
        },
        updateDroneStatus: (state, action) => {
            const { droneId, status } = action.payload
            const drone = state.drones.find(d => d._id === droneId)
            if (drone) {
                drone.status = status
            }
        },
        selectDrone: (state, action) => {
            state.selectedDrone = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
    },
})

export const { 
    setDrones, 
    addDrone,
    updateDrone,
    removeDrone,
    updateDroneLocation, 
    updateDroneStatus,
    selectDrone,
    setLoading,
    setError
} = droneSlice.actions

export default droneSlice.reducer