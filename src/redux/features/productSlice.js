import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (productData, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/product/", productData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create product");
        }
    }
);

export const getAllProducts = createAsyncThunk(
    "product/getAllProducts",
    async ({title, globalSearch, category, brand, condition, price, sellerSlug, page, skip, append, isAdmin}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/product/`, {params: {title, globalSearch, category, brand, condition, price, sellerSlug, page, skip}});
            return {...res.data, append, sellerSlug, globalSearch, isAdmin};
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch products");
        }
    }
);

export const getSingleProduct = createAsyncThunk(
    "product/getSingleProduct",
    async ({slug}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/product/${slug}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch product");
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async (productData, thunkAPI) => {
        try{
            const res = await axiosInstance.put(`/product/${productData._id}`, productData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update product");
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "product/deleteProduct",
    async ({productId, isAdmin}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/product/${productId}`);
            return {...res.data, productId, isAdmin}
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete product");
        }
    }
);

const handlePending = (state) => {
    state.loading = true;
    state.error = null;
    state.successMessage = null;
    state.isFetchingChecked = false;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isFetchingChecked = true;
};

const handleDuplicatedData = (products) => {
    const seen = new Set();
    const combinedProducts = products?.filter(p => {
        if (seen.has(p.title.toLowerCase())) return false;
        seen.add(p.title.toLowerCase());
        return true;
    });
    return combinedProducts;
}

const initialListState = {
    products: [],
    hasMore: false,
    nextSkip: 0,
    loading: false,
    isFetchingChecked: false,
    error: null,
    successMessage: null
}

const initialState = {
    shopping: {
        ...initialListState,
        productsAdminFetched: false,
        page: 1,
        totalPages: 1,
        totalProducts: 0,
    },
    search: {
        ...initialListState
    },
    store: {
        ...initialListState,
        page: 1,
        totalPages: 1,
        totalProducts: 0,
    },
    singleProduct: {
        product: null,
        loading: false,
        isFetchingChecked: false,
        error: null,
        successMessage: null
    }
}

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        resetShopping: (state) => {
            state.shopping = {
                ...initialListState,
                page: 1,
                totalPages: 1,
                totalProducts: 0,
            }
        },
        resetSearch: (state) => {
            state.search = {...initialListState}
        },
        resetStore: (state) => {
            state.store = {
                ...initialListState,
                page: 1,
                totalPages: 1,
                totalProducts: 0,
            }
        },
        resetSingleProduct: (state) => {
            state.singleProduct = {
                product: null,
                loading: false,
                isFetchingChecked: false,
                error: null,
                successMessage: null
            }
        },
        resetMessages: (state) => {
            for (const key of ["shopping", "search", "store", "singleProduct"]) {
                state[key].successMessage = null;
                state[key].error = null;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // create a product
            .addCase(createProduct.pending, (state) => handlePending(state.singleProduct))
            .addCase(createProduct.fulfilled, (state, action) => {
                state.singleProduct.loading = false;
                state.singleProduct.product = action.payload.product;
                state.singleProduct.successMessage = action.payload.message;
                state.singleProduct.isFetchingChecked = true;
            })
            .addCase(createProduct.rejected, (state, action) => handleRejected(state.singleProduct, action))

            // fetch all products
            .addCase(getAllProducts.pending, (state, action) => {
                const {sellerSlug, globalSearch} = action.meta.arg;
                let targetSlice;

                if (sellerSlug) targetSlice = state.store;
                else if (globalSearch) targetSlice = state.search;
                else targetSlice = state.shopping;
                handlePending(targetSlice);
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                if (action.payload.sellerSlug){
                    state.store.loading = false;
                    state.store.products = action.payload.products;
                    state.store.page = action.payload.page;
                    state.store.totalPages = action.payload.totalPages;
                    state.store.totalProducts = action.payload.totalProducts;
                    state.store.isFetchingChecked = true;
                }
                else if (action.payload.globalSearch){
                    state.search.loading = false;
                    if (action.payload.append){
                        const currentAppendedState = [...state.search.products, ...action.payload.products];
                        const combinedProducts = handleDuplicatedData(currentAppendedState);
                        state.search.products = combinedProducts;
                    }
                    else{
                        const combinedProducts = handleDuplicatedData(action.payload.products);
                        state.search.products = combinedProducts;
                    }
                    state.search.hasMore = action.payload.hasMore;
                    state.search.nextSkip = action.payload.nextSkip;
                    if (action.payload.message) state.search.successMessage = action.payload.message;
                    state.search.isFetchingChecked = true;
                }
                else{
                    state.shopping.loading = false;
                    if (action.payload.append){
                        state.shopping.products = [...state.shopping.products, ...action.payload.products];
                    }
                    else{
                        state.shopping.products = action.payload.products;
                    }
                    if (action.payload.isAdmin){
                        state.shopping.productsAdminFetched = true;
                    }
                    else{
                        state.shopping.productsAdminFetched = false;
                    }
                    state.shopping.hasMore = action.payload.hasMore;
                    state.shopping.nextSkip = action.payload.nextSkip;
                    state.shopping.totalPages = action.payload.totalPages;
                    state.shopping.totalProducts = action.payload.totalProducts;
                    state.shopping.page = action.payload.page;
                    state.shopping.isFetchingChecked = true;
                }
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                const {sellerSlug, globalSearch} = action.meta.arg;
                let targetSlice;

                if (sellerSlug) targetSlice = state.store;
                else if (globalSearch) targetSlice = state.search;
                else targetSlice = state.shopping;
                handleRejected(targetSlice, action);
            })

           // fetch a single product
            .addCase(getSingleProduct.pending, (state) => handlePending(state.singleProduct))
            .addCase(getSingleProduct.fulfilled, (state, action) => {
                state.singleProduct.loading = false;
                state.singleProduct.product = action.payload.product;
                state.singleProduct.isFetchingChecked = true;
            })
            .addCase(getSingleProduct.rejected, (state, action) => handleRejected(state.singleProduct, action))

            // update a product
            .addCase(updateProduct.pending, (state) => handlePending(state.singleProduct))
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.singleProduct.loading = false;
                state.singleProduct.product = action.payload.product;
                state.singleProduct.successMessage = action.payload.message;
                state.singleProduct.isFetchingChecked = true;
            })
            .addCase(updateProduct.rejected, (state, action) => handleRejected(state.singleProduct, action))
            
            // delete a single product
            .addCase(deleteProduct.pending, (state, action) => {
                const {isAdmin} = action.meta.arg;
                let targetSlice;

                if (isAdmin) targetSlice = state.shopping;
                else targetSlice = state.store;
                handlePending(targetSlice);
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                const productId = action.payload.productId;
                const isAdmin = action.payload.isAdmin;

                if (isAdmin){
                    state.shopping.loading = false;
                    state.shopping.successMessage = action.payload.message;
                    state.shopping.isFetchingChecked = true;
                }
                else{
                    state.store.loading = false;
                    state.store.products = state.store.products.filter(p => p._id !== productId);
                    state.store.totalProducts -= 1;
                    state.store.totalPages = Math.ceil(state.store.totalProducts / 4);
                    state.store.successMessage = action.payload.message;
                    state.store.isFetchingChecked = true;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                const {isAdmin} = action.meta.arg;
                let targetSlice;

                if (isAdmin) targetSlice = state.shopping;
                else targetSlice = state.store;
                handleRejected(targetSlice, action);
            })
    }
});

export const { resetMessages, resetSearch, resetShopping, resetStore, resetSingleProduct} = productSlice.actions;
export default productSlice.reducer;