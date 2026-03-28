import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const getAllNotifications = createAsyncThunk(
    "notification/getAllNotifications",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/notification/`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get notifications");
        }
    }
);

export const getUnreadNotifications = createAsyncThunk(
    "notification/getUnreadNotifications",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/notification/unread-count`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get unread notifications");
        }
    }
);

export const readANotification = createAsyncThunk(
    "notification/readANotification",
    async ({notificationId}, thunkAPI) => {
        try{
            const res = await axiosInstance.patch(`/notification/${notificationId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to read notification");
        }
    }
);

export const readAllNotifications = createAsyncThunk(
    "notification/readAllNotifications",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.patch(`/notification/readAll`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to read all notifications");
        }
    }
);

export const deleteANotification = createAsyncThunk(
    "notification/deleteANotification",
    async ({notificationId}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/notification/${notificationId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete notification");
        }
    }
);

export const deleteAllNotifications = createAsyncThunk(
    "notification/deleteAllNotifications",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/notification/deleteAll`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete all notifications");
        }
    }
);

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
  state.successMessage = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  if (action.payload.notifications) state.notifications = action.payload.notifications;
  if (action.payload.count) state.unreadCount = action.payload.count;
  if (action.payload.successMessage) state.successMessage = action.payload.message;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    successMessage: null,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        },
        addRealTimeNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        }
    },
    extraReducers: (builder) => {
        builder
           // get all categories
           .addCase(getAllNotifications.pending, handlePending)
           .addCase(getAllNotifications.fulfilled, handleFulfilled)
           .addCase(getAllNotifications.rejected, handleRejected)
           // get all unread notifications
           .addCase(getUnreadNotifications.pending, handlePending)
           .addCase(getUnreadNotifications.fulfilled, handleFulfilled)
           .addCase(getUnreadNotifications.rejected, handleRejected)
           // read a notification
           .addCase(readANotification.pending, handlePending)
           .addCase(readANotification.fulfilled, (state, action) => {
                state.loading = false;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
                const notif = state.notifications.find(n => n._id === action.payload.updatedNotification._id);
                if (notif) notif.read = true;
                state.successMessage = action.payload.message;
           })
           .addCase(readANotification.rejected, handleRejected)
           // read all notifications
           .addCase(readAllNotifications.pending, handlePending)
           .addCase(readAllNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications.forEach(n => {
                    n.read = true;
                })
                state.unreadCount = 0;
                state.successMessage = action.payload.message;
           })
           .addCase(readAllNotifications.rejected, handleRejected)
           // delete a notification
           .addCase(deleteANotification.pending, handlePending)
           .addCase(deleteANotification.fulfilled, (state, action) => {
                state.loading = false;
                const deletedNotification = action.payload.deletedNotification;
                if (!deletedNotification.read){
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(n => n._id !== action.payload.deletedNotification._id);
                state.successMessage = action.payload.message;
           })
           .addCase(deleteANotification.rejected, handleRejected)
           // delete all notifications
           .addCase(deleteAllNotifications.pending, handlePending)
           .addCase(deleteAllNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = [];
                state.unreadCount = 0;
                state.successMessage = action.payload.message;
           })
           .addCase(deleteAllNotifications.rejected, handleRejected)
    }
});

export const { resetMessages, addRealTimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;