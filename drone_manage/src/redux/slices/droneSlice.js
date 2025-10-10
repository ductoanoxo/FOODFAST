import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    drones: [],
    selectedDrone: null,
    loading: false,
}

const droneSlice = createSlice({
    name: 'drone',
    initialState,
    reducers: {
        setDrones: (state, action) => {
            state.drones = action.payload
        },
        updateDroneLocation: (state, action) => {
            const { droneId, location } = action.payload
            const drone = state.drones.find(d => d._id === droneId)
            if (drone) {
                drone.currentLocation = location
            }
        },
        selectDrone: (state, action) => {
            state.selectedDrone = action.payload
        },
    },
})

export const { setDrones, updateDroneLocation, selectDrone } = droneSlice.actions
export default droneSlice.reducer