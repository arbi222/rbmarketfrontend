import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (categoryData, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/category/", categoryData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create category");
        }
    }
);

export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async (categoryData, thunkAPI) => {
        try{
            const res = await axiosInstance.put(`/category/${categoryData.categoryId}`, categoryData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update category");
        }
    }
);

export const getSingleCategory = createAsyncThunk(
    "category/getSingleCategory",
    async ({categoryId}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/category/${categoryId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch the category");
        }
    }
);

export const getAllCategories = createAsyncThunk(
    "category/getAllCategories",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/category/all/categories`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to get categories");
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "category/deleteCategory",
    async ({categoryId}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/category/${categoryId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete category");
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
  if (action.payload.categories) state.categories = action.payload.categories;
  if (action.payload.category) state.singleCategory = action.payload.category;
  state.successMessage = action.payload.message;
  state.error = null;
  state.isFetchingChecked = true;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isFetchingChecked = true;
};

const initialState = {
    categories: [],
    singleCategory: null,
    loading: false,
    error: null,
    successMessage: null,
    isFetchingChecked: false
};

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        },
        resetSingleCategory: (state) => {
            state.singleCategory = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // create a category
           .addCase(createCategory.pending, handlePending)
           .addCase(createCategory.fulfilled, handleFulfilled)
           .addCase(createCategory.rejected, handleRejected)
           // update a category
           .addCase(updateCategory.pending, handlePending)
           .addCase(updateCategory.fulfilled, handleFulfilled)
           .addCase(updateCategory.rejected, handleRejected)
           // get a single category
           .addCase(getSingleCategory.pending, handlePending)
           .addCase(getSingleCategory.fulfilled, handleFulfilled)
           .addCase(getSingleCategory.rejected, handleRejected)
           // get all categories
           .addCase(getAllCategories.pending, handlePending)
           .addCase(getAllCategories.fulfilled, handleFulfilled)
           .addCase(getAllCategories.rejected, handleRejected)
           // delete category
           .addCase(deleteCategory.pending, handlePending)
           .addCase(deleteCategory.fulfilled, handleFulfilled)
           .addCase(deleteCategory.rejected, handleRejected)
    }
});

export const { resetMessages, resetSingleCategory } = categorySlice.actions;
export default categorySlice.reducer;