import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const getAllUsers = createAsyncThunk(
    "admin/getAllUsers",
    async ({page, search, accountStatus}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/user/admin/getUsers`, {params: {page, search, accountStatus}});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch all users");
        }
    }
);

export const getDashboardData = createAsyncThunk(
    "admin/getDashboardData",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/user/admin/getDashboard`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard data");
        }
    }
);

export const getAllReviews = createAsyncThunk(
    "admin/getAllReviews",
    async ({page}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/review/allReviews`, {params: {page}});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch all reviews");
        }
    }
);

export const getAllTransactions = createAsyncThunk(
    "admin/getAllTransactions",
    async ({page, type}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/transaction/all`, {params: {page, type}});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch all transactions");
        }
    }
);

export const getSingleTransaction = createAsyncThunk(
    "admin/getSingleTransaction",
    async ({transactionId}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/transaction/${transactionId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch transaction");
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    "admin/deleteTransaction",
    async ({transactionId}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/transaction/${transactionId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete transaction");
        }
    }
);

const initialListState = {
    items: [],
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    loading: false,
    isFetchingChecked: false,
    error: null,
    successMessage: null
}

const initialState = {
    users: {
        ...initialListState,
        dashboardData: null,
        usersFetched: false,
    },
    reviews: {
        ...initialListState,
        reviewsFetched: false,
    },
    transactions: {
        ...initialListState,
        singleTransaction: null
    }
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.users.error = null;
            state.reviews.successMessage = null;
        },
        resetUsers: (state) => {
            state.users.items = [];
            state.users.page = 1;
            state.users.totalPages = 1;
            state.users.totalProducts = 0;
        },
        updateUserStatus: (state, action) => {
            const updatedUserId = action.payload._id;
            const updatedUserStatus = action.payload.status;

            const user = state.users.items.find(u => u._id === updatedUserId);
            if (user){
                user.accountStatus = updatedUserStatus;
            }
        },
        resetSingleTransaction: (state) => {
            state.transactions.singleTransaction = null;
        },
        resetTransactionMessages: (state) => {
            state.transactions.error = null;
            state.transactions.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // getting all users
        .addCase(getAllUsers.pending, (state) => {
            state.users.loading = true;
            state.users.error = null;
            state.users.successMessage = null;
            state.users.isFetchingChecked = false;
        })
        .addCase(getAllUsers.fulfilled, (state, action) => {
            state.users.loading = false;
            state.users.items = action.payload.users;
            state.users.page = action.payload.page;
            state.users.totalPages = action.payload.totalPages;
            state.users.totalItems = action.payload.totalUsers;
            state.users.isFetchingChecked = true;
            state.users.usersFetched = true;
        })
        .addCase(getAllUsers.rejected, (state, action) => {
            state.users.loading = false;
            state.users.error = action.payload;
            state.users.isFetchingChecked = true;
        })
        // getting dashboard data
        .addCase(getDashboardData.pending, (state) => {
            state.users.loading = true;
            state.users.error = null;
            state.users.successMessage = null;
            state.users.isFetchingChecked = false;
        })
        .addCase(getDashboardData.fulfilled, (state, action) => {
            state.users.loading = false;
            state.users.dashboardData = action.payload;
            state.users.isFetchingChecked = true;
        })
        .addCase(getDashboardData.rejected, (state, action) => {
            state.users.loading = false;
            state.users.error = action.payload;
            state.users.isFetchingChecked = true;
        })
        // getting all reviews
        .addCase(getAllReviews.pending, (state) => {
            state.reviews.loading = true;
            state.reviews.error = null;
            state.reviews.successMessage = null;
            state.reviews.isFetchingChecked = false;
        })
        .addCase(getAllReviews.fulfilled, (state, action) => {
            state.reviews.loading = false;
            state.reviews.items = action.payload.reviews;
            state.reviews.page = action.payload.page;
            state.reviews.totalPages = action.payload.totalPages;
            state.reviews.totalItems = action.payload.totalReviews;
            state.reviews.isFetchingChecked = true;
            state.reviews.reviewsFetched = true;
        })
        .addCase(getAllReviews.rejected, (state, action) => {
            state.reviews.loading = false;
            state.reviews.error = action.payload;
            state.reviews.isFetchingChecked = true;
        })    
        // getting all transactions
        .addCase(getAllTransactions.pending, (state) => {
            state.transactions.loading = true;
            state.transactions.error = null;
            state.transactions.successMessage = null;
            state.transactions.isFetchingChecked = false;
        })
        .addCase(getAllTransactions.fulfilled, (state, action) => {
            state.transactions.loading = false;
            state.transactions.items = action.payload.transactions;
            state.transactions.page = action.payload.page;
            state.transactions.totalPages = action.payload.totalPages;
            state.transactions.totalItems = action.payload.totalTransactions;
            state.transactions.isFetchingChecked = true;
        })
        .addCase(getAllTransactions.rejected, (state, action) => {
            state.transactions.loading = false;
            state.transactions.error = action.payload;
            state.transactions.isFetchingChecked = true;
        })
        // get a transaction
        .addCase(getSingleTransaction.pending, (state) => {
            state.transactions.loading = true;
            state.transactions.error = null;
            state.transactions.successMessage = null;
            state.transactions.isFetchingChecked = false;
        })
        .addCase(getSingleTransaction.fulfilled, (state, action) => {
            state.transactions.loading = false;
            state.transactions.singleTransaction = action.payload.transaction;
            state.transactions.isFetchingChecked = true;
        })
        .addCase(getSingleTransaction.rejected, (state, action) => {
            state.transactions.loading = false;
            state.transactions.error = action.payload;
            state.transactions.isFetchingChecked = true;
        })     
        // delete transaction
        .addCase(deleteTransaction.pending, (state) => {
            state.transactions.loading = true;
            state.transactions.error = null;
            state.transactions.successMessage = null;
            state.transactions.isFetchingChecked = false;
        })
        .addCase(deleteTransaction.fulfilled, (state, action) => {
            state.transactions.loading = false;
            state.transactions.successMessage = action.payload.message;
            state.transactions.isFetchingChecked = true;
        })
        .addCase(deleteTransaction.rejected, (state, action) => {
            state.transactions.loading = false;
            state.transactions.error = action.payload;
            state.transactions.isFetchingChecked = true;
        })  
    }
});

export const { resetMessages, resetUsers, updateUserStatus, resetSingleTransaction, resetTransactionMessages } = adminSlice.actions;
export default adminSlice.reducer;