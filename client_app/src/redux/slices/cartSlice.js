import { createSlice } from '@reduxjs/toolkit'

const loadCartFromStorage = () => {
    try {
        const cart = localStorage.getItem('cart')
        return cart ? JSON.parse(cart) : []
    } catch {
        return []
    }
}

const initialState = {
    items: loadCartFromStorage(),
    totalItems: 0,
    totalPrice: 0,
}

const calculateTotals = (items) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return { totalItems, totalPrice }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        ...initialState,
        ...calculateTotals(initialState.items)
    },
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload
            const existingItem = state.items.find(i => i._id === item._id)

            if (existingItem) {
                existingItem.quantity += item.quantity || 1
            } else {
                state.items.push({...item, quantity: item.quantity || 1 })
            }

            const totals = calculateTotals(state.items)
            state.totalItems = totals.totalItems
            state.totalPrice = totals.totalPrice
            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload)
            const totals = calculateTotals(state.items)
            state.totalItems = totals.totalItems
            state.totalPrice = totals.totalPrice
            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const item = state.items.find(i => i._id === id)
            if (item) {
                item.quantity = quantity
            }
            const totals = calculateTotals(state.items)
            state.totalItems = totals.totalItems
            state.totalPrice = totals.totalPrice
            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        clearCart: (state) => {
            state.items = []
            state.totalItems = 0
            state.totalPrice = 0
            localStorage.removeItem('cart')
        },
    },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer