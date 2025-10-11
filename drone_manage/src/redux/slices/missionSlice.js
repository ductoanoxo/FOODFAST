import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    missions: [],
    selectedMission: null,
    loading: false,
    error: null,
}

const missionSlice = createSlice({
    name: 'mission',
    initialState,
    reducers: {
        setMissions: (state, action) => {
            state.missions = action.payload
            state.loading = false
        },
        addMission: (state, action) => {
            state.missions.unshift(action.payload)
        },
        updateMission: (state, action) => {
            const index = state.missions.findIndex(m => m._id === action.payload._id)
            if (index !== -1) {
                state.missions[index] = action.payload
            }
        },
        removeMission: (state, action) => {
            state.missions = state.missions.filter(m => m._id !== action.payload)
        },
        selectMission: (state, action) => {
            state.selectedMission = action.payload
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
    setMissions, 
    addMission, 
    updateMission, 
    removeMission, 
    selectMission,
    setLoading,
    setError 
} = missionSlice.actions

export default missionSlice.reducer
