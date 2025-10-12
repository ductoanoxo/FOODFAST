import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderAPI from '../../api/orderAPI';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (status, { rejectWithValue }) => {
    try {
      const data = await orderAPI.getRestaurantOrders(status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const data = await orderAPI.updateOrderStatus(orderId, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    stats: {
      total: 0,
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    updateOrderInList: (state, action) => {
      const index = state.orders.findIndex(o => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || action.payload;

        // Calculate stats (treat 'delivered' as completed for compatibility with backend)
        const orders = state.orders;
        state.stats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          preparing: orders.filter(o => o.status === 'preparing').length,
          delivering: orders.filter(o => o.status === 'delivering').length,
          completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data || action.payload;
        const index = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        // Recalculate stats (include 'delivered' as completed)
        const orders = state.orders;
        state.stats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          preparing: orders.filter(o => o.status === 'preparing').length,
          delivering: orders.filter(o => o.status === 'delivering').length,
          completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        };
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentOrder, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;
