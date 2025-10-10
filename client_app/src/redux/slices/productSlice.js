import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: [],
    categories: [],
    restaurants: [],
    loading: false,
    error: null,
    filters: {
        search: '',
        category: '',
        restaurant: '',
        priceRange: [0, 500000],
        sortBy: 'popular',
    },
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload
        },
        setCategories: (state, action) => {
            state.categories = action.payload
        },
        setRestaurants: (state, action) => {
            state.restaurants = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setFilters: (state, action) => {
            state.filters = {...state.filters, ...action.payload }
        },
        resetFilters: (state) => {
            state.filters = initialState.filters
        },
    },
})

export const {
    setProducts,
    setCategories,
    setRestaurants,
    setLoading,
    setError,
    setFilters,
    resetFilters
} = productSlice.actions

export default productSlice.reducer