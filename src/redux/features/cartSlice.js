import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

const CART_KEY = "guest_cart";

export const loadGuestCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Invalid guest cart in localStorage", err);
    return [];
  }
};

const saveGuestCart = (items) => 
    localStorage.setItem(CART_KEY, JSON.stringify(items));


export const fetchUserCart = createAsyncThunk(
    "cart/fetchUserCart",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get("/cart");
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch user's cart");
        }
    }
);

export const hydrateGuestCart = createAsyncThunk(
  "cart/hydrateGuestCart",
  async (items, thunkAPI) => {
    try{
        const res = await axiosInstance.post("/cart/hydrateGuest", {items});
        return res.data;
    }
    catch(err){
        return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to hydrate guest cart");
    }
  }
);

export const addToCartCall = createAsyncThunk(
    "cart/addToCartCall",
    async (cartData, thunkAPI) => {
         try{
            const res = await axiosInstance.post("/cart/add", cartData);
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to add to cart");
        }
    }
);

export const updateQuantityCall = createAsyncThunk(
    "cart/updateQuantityCall",
    async (cartData, thunkAPI) => {
         try{
            const res = await axiosInstance.put("/cart/updateCart", cartData);
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update to cart");
        }
    }
);

export const removeFromCartCall = createAsyncThunk(
    "cart/removeFromCartCall",
    async (productId, thunkAPI) => {
         try{
            const res = await axiosInstance.delete(`/cart/deleteItem/${productId}`);
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete item from cart");
        }
    }
);

export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, thunkAPI) => {
         try{
            const res = await axiosInstance.delete("/cart/deleteAll");
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to clear cart");
        }
    }
);

export const mergeGuestCart = createAsyncThunk(
    "cart/mergeGuestCart",
    async (items, thunkAPI) => {
         try{
            const res = await axiosInstance.post("/cart/merge", items);
            return res.data;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to merge cart");
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
  state.items = action.payload.items;
  if (action.payload.items) state.cartBadge = action.payload.items.length;
  state.successMessage = action.payload.message;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const initialState = {
    guestItems: loadGuestCart(),
    items: [],
    hydrated: false,
    cartBadge: 0,
    loading: false,
    error: null,
    successMessage: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart(state, action) {
            const {productId, quantity, stock} = action.payload;
            const item = state.guestItems.find(i => i.productId === productId);

            if (item){
                const newQuantity = item.quantity + quantity;
                item.quantity = newQuantity > stock ? stock : newQuantity;
            } 
            else {
                const newQuantity = quantity > stock ? stock : quantity;
                state.guestItems.push({productId, quantity: newQuantity});
            }

            saveGuestCart(state.guestItems);
            state.hydrated = false;
        },
        removeFromCart(state, action) {
            state.guestItems = state.guestItems.filter(
              i => i.productId !== action.payload
            );
            saveGuestCart(state.guestItems);

            state.items = state.items.filter(
              i => i.product._id !== action.payload
            );

            state.cartBadge = state.items.length;
            // state.hydrated = false;
        },
        updateQuantity(state, action) {
            const {productId, quantity, stock} = action.payload;

            const safeQuantity = Math.max(1, Math.min(stock, quantity));

            const guestItem = state.guestItems.find(
              i => i.productId === productId
            );

            if (guestItem){
                guestItem.quantity = safeQuantity;
            }

            saveGuestCart(state.guestItems);

            const item = state.items.find(
                i => i.product._id === productId
            );
        
            if (item) {
                item.quantity = safeQuantity;
            }
        },
        clearGuestCart(state) {
            state.items = [];
            state.guestItems = [];
            state.cartBadge = 0;
            state.hydrated = false;
            localStorage.removeItem(CART_KEY);
        },
        removeGuest(state) {
            state.guestItems = [];
            localStorage.removeItem(CART_KEY);
        },
        resetMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // fetch user's cart
        .addCase(fetchUserCart.pending, handlePending)
        .addCase(fetchUserCart.fulfilled, handleFulfilled)
        .addCase(fetchUserCart.rejected, handleRejected)

        // hydrate the guest cart
        .addCase(hydrateGuestCart.pending, handlePending)
        .addCase(hydrateGuestCart.fulfilled, (state, action) => {
            state.items = action.payload.items;
            state.cartBadge = action.payload.items.length;
            state.hydrated = true;
            state.loading = false;
        })
        .addCase(hydrateGuestCart.rejected, handleRejected)

        // add to cart 
        .addCase(addToCartCall.pending, handlePending)
        .addCase(addToCartCall.fulfilled, handleFulfilled)
        .addCase(addToCartCall.rejected, handleRejected)

        // update cart quantity for items
        .addCase(updateQuantityCall.pending, (state) => {
            state.error = null;
            state.successMessage = null;
        })
        .addCase(updateQuantityCall.fulfilled, handleFulfilled)
        .addCase(updateQuantityCall.rejected, handleRejected)

        // clear cart
        .addCase(clearCart.pending, handlePending)
        .addCase(clearCart.fulfilled, handleFulfilled)
        .addCase(clearCart.rejected, handleRejected)

        // remove item from cart
        .addCase(removeFromCartCall.pending, (state) => {
            state.error = null;
            state.successMessage = null;
        })
        .addCase(removeFromCartCall.fulfilled, handleFulfilled)
        .addCase(removeFromCartCall.rejected, handleRejected)
        
        // merge guest cart with user cart
        .addCase(mergeGuestCart.pending, handlePending)
        .addCase(mergeGuestCart.fulfilled, handleFulfilled)
        .addCase(mergeGuestCart.rejected, handleRejected)
    }
});

export const { addToCart, removeFromCart, clearGuestCart, removeGuest, updateQuantity, resetMessages } = cartSlice.actions;
export default cartSlice.reducer;