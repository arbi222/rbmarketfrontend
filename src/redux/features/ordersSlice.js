import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";


export const deleteOrder = createAsyncThunk(
    "reviews/deleteOrder",
    async ({orderId, isAdmin}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/order/${orderId}`);
            return {...res.data, orderId, isAdmin};
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete order");
        }
    }
)

export const getBuyerOrders = createAsyncThunk(
    "orders/getBuyerOrders",
    async ({buyerId, skip, page, status, append}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/order/orders/${buyerId}`, {params: {skip, page, status}});
            return {...res.data, append};
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get orders");
        }
    }
)

export const getSingleOrder = createAsyncThunk(
    "orders/getSingleOrder",
    async ({id}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/order/${id}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get order");
        }
    }
)

export const updateOrder = createAsyncThunk(
    "orders/cancelOrder",
    async ({orderId, status}, thunkAPI) => {
        try{
            const res = await axiosInstance.patch(`/order/${orderId}`, {status});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to cancel order!");
        }
    }
)

const handlePending = (state) => {
    state.loading = true;
    state.error = null;
    state.successMessage = null;
    state.isFetchingChecked = false;
};

const handleFulfilled = (state, action) => {
    state.loading = false;
    if (action.payload.message) state.successMessage = action.payload.message;
    if (action.payload.order) state.order = action.payload.order;
    if (action.payload.append && action.payload.orders){
        state.orders = [...state.orders, ...action.payload.orders];
    }
    else{
        state.orders = action.payload.orders;
    }
    if (action.payload.orders) {
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalOrders = action.payload.totalOrders;
        state.hasMore = action.payload.hasMore;
        state.nextSkip = action.payload.nextSkip;
    }
    state.isFetchingChecked = true;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isFetchingChecked = true;
};

const initialState = {
    orders: [],
    order: null,
    page: 1,
    totalPages: 1,
    totalOrders: 0,
    hasMore: false,
    nextSkip: 0,
    loading: false,
    error: null,
    successMessage: null,
    isFetchingChecked: false
};

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        resetOrders: (state) => {
            state.orders = [];
            state.order = null;
            state.page = 1;
            state.totalPages = 1;
            state.totalOrders = 0;
            state.isFetchingChecked = false;
        },
        resetSingleOrder: (state) => {
            state.order = null;
            state.isFetchingChecked = false;
        },
        setSingleOrder: (state, action) => {
            state.order = action.payload;
        },
        resetMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // get orders
            .addCase(getBuyerOrders.pending, handlePending)
            .addCase(getBuyerOrders.fulfilled, handleFulfilled)
            .addCase(getBuyerOrders.rejected, handleRejected)
            // get a single order
            .addCase(getSingleOrder.pending, handlePending)
            .addCase(getSingleOrder.fulfilled, handleFulfilled)
            .addCase(getSingleOrder.rejected, handleRejected)
            // delete an order
            .addCase(deleteOrder.pending, handlePending)
            .addCase(deleteOrder.fulfilled, (state, action) => {
                if (!action.payload.isAdmin){
                    state.orders = state.orders.filter(order => order._id !== action.payload.orderId);
                    state.totalOrders = state.totalOrders - 1;
                }
                state.loading = false;
                state.successMessage = action.payload.message;
                state.isFetchingChecked = true;
            })
            .addCase(deleteOrder.rejected, handleRejected)
            // cancel an order
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.order = action.payload.order;
                state.successMessage = action.payload.message;
            })
            .addCase(updateOrder.rejected, handleRejected)
    }
});

export const { resetOrders, resetSingleOrder, resetMessages, setSingleOrder } = ordersSlice.actions;
export default ordersSlice.reducer;