import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const createBrand = createAsyncThunk(
    "brand/createBrand",
    async (brandData, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/brand/", brandData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create brand");
        }
    }
);

export const updateBrand = createAsyncThunk(
    "brand/updateBrand",
    async (brandData, thunkAPI) => {
        try{
            const res = await axiosInstance.put(`/brand/${brandData.brandId}`, brandData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update brand");
        }
    }
);

export const getAllBrands = createAsyncThunk(
    "brand/getAllBrands",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/brand/`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch brands");
        }
    }
);

export const getSingleBrand = createAsyncThunk(
    "brand/getSingleBrand",
    async ({brandId}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/brand/${brandId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch the brand");
        }
    }
);

export const getTopBrands = createAsyncThunk(
    "brand/getTopBrands",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/brand/topBrands`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch the top brands");
        }
    }
);

export const deleteBrand = createAsyncThunk(
    "brand/deleteBrand",
    async ({brandId}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/brand/${brandId}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete brand");
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
  if (action.payload.brands) state.brands = action.payload.brands;
  if (action.payload.topBrands) state.topBrands = action.payload.topBrands;
  if (action.payload.brand) state.singleBrand = action.payload.brand;
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
    brands: [],
    topBrands: [],
    singleBrand: null,
    loading: false,
    error: null,
    successMessage: null,
    isFetchingChecked: false
};

const brandSlice = createSlice({
    name: "brand",
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        },
        resetSingleBrand: (state) => {
            state.singleBrand = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // create a brand
           .addCase(createBrand.pending, handlePending)
           .addCase(createBrand.fulfilled, handleFulfilled)
           .addCase(createBrand.rejected, handleRejected)
           // update a brand
           .addCase(updateBrand.pending, handlePending)
           .addCase(updateBrand.fulfilled, handleFulfilled)
           .addCase(updateBrand.rejected, handleRejected)
           // get all brands
           .addCase(getAllBrands.pending, handlePending)
           .addCase(getAllBrands.fulfilled, handleFulfilled)
           .addCase(getAllBrands.rejected, handleRejected)
           // get a single brand
           .addCase(getSingleBrand.pending, handlePending)
           .addCase(getSingleBrand.fulfilled, handleFulfilled)
           .addCase(getSingleBrand.rejected, handleRejected)
           // get top brands
           .addCase(getTopBrands.pending, handlePending)
           .addCase(getTopBrands.fulfilled, handleFulfilled)
           .addCase(getTopBrands.rejected, handleRejected)
           // delete brand
           .addCase(deleteBrand.pending, handlePending)
           .addCase(deleteBrand.fulfilled, handleFulfilled)
           .addCase(deleteBrand.rejected, handleRejected)
    }
});

export const { resetMessages, resetSingleBrand } = brandSlice.actions;
export default brandSlice.reducer;