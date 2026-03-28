import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const createReview = createAsyncThunk(
    "reviews/createReview",
    async ({productId, comment, vote}, thunkAPI) => {
        try{
            const res = await axiosInstance.post(`/review/${productId}`, {comment, vote});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create review");
        }
    }
)

export const updateReview = createAsyncThunk(
    "reviews/updateReview",
    async ({reviewId, comment, vote}, thunkAPI) => {
        try{
            const res = await axiosInstance.put(`/review/${reviewId}`, {comment, vote});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update review");
        }
    }
)

export const deleteReview = createAsyncThunk(
    "reviews/deleteReview",
    async ({reviewId}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/review/${reviewId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete review");
        }
    }
)

export const getProductReviews = createAsyncThunk(
    "reviews/getProductReviews",
    async ({productId, page}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/review/product/${productId}?page=${page}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get reviews");
        }
    }
)

export const getSellerReviews = createAsyncThunk(
    "reviews/getSellerReviews",
    async ({sellerId, page}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/review/seller/${sellerId}?page=${page}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get reviews");
        }
    }
)

export const checkForReview = createAsyncThunk(
    "reviews/checkForReview",
    async ({productId}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/review/canReview/${productId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to check if you can review this product or not.");
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
    if (action.payload.review) {
        const updatedReview = action.payload.review;

        const index = state.reviews.findIndex(
          (r) => r._id === updatedReview._id
        );

        if (index !== -1) {
          state.reviews[index] = updatedReview;
        }
    }
    if (action.payload.reviews) {
        state.reviews = action.payload.reviews;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalReviews = action.payload.totalReviews;
    }
    if (action.payload.canReview !== undefined){
        state.canReview = action.payload.canReview;
    } 
    state.isFetchingChecked = true;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isFetchingChecked = true;
};


const initialState = {
    reviews: [],
    review: null,
    page: 1,
    totalPages: 1,
    totalReviews: 0,
    canReview: false,
    loading: false,
    error: null,
    successMessage: null,
    isFetchingChecked: false
};

const reviewSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        resetReviews: (state) => {
            state.reviews = [];
            state.review = null;
            state.page = 1;
            state.totalPages = 1;
            state.totalReviews = 0;
            state.isFetchingChecked = false;
        },
        resetMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // create a review
            .addCase(createReview.pending, handlePending)
            .addCase(createReview.fulfilled, handleFulfilled)
            .addCase(createReview.rejected, handleRejected)
            // update a review
            .addCase(updateReview.pending, handlePending)
            .addCase(updateReview.fulfilled, handleFulfilled)
            .addCase(updateReview.rejected, handleRejected)
            // get product reviews
            .addCase(getProductReviews.pending, handlePending)
            .addCase(getProductReviews.fulfilled, handleFulfilled)
            .addCase(getProductReviews.rejected, handleRejected)
            // get seller reviews
            .addCase(getSellerReviews.pending, handlePending)
            .addCase(getSellerReviews.fulfilled, handleFulfilled)
            .addCase(getSellerReviews.rejected, handleRejected)
            // check if can review a product
            .addCase(checkForReview.pending, handlePending)
            .addCase(checkForReview.fulfilled, handleFulfilled)
            .addCase(checkForReview.rejected, handleRejected)
            // delete a review
            .addCase(deleteReview.pending, handlePending)
            .addCase(deleteReview.fulfilled, handleFulfilled)
            .addCase(deleteReview.rejected, handleRejected)
    }
});

export const { resetReviews, resetMessages } = reviewSlice.actions;
export default reviewSlice.reducer;