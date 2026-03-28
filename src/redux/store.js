import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./features/authSlice";
import userReducer from "./features/userSlice";
import categoryReducer from "./features/categorySlice";
import brandReducer from "./features/brandSlice";
import productReducer from "./features/productSlice";
import reviewReducer from "./features/reviewSlice";
import cartReducer from "./features/cartSlice";
import notificationReducer from "./features/notificationSlice";
import orderReducer from "./features/ordersSlice";
import adminReducer from "./features/adminSlice";
import uiReducer from "./features/uiSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        category: categoryReducer,
        brand: brandReducer,
        product: productReducer,
        review: reviewReducer,
        cart: cartReducer,
        notification: notificationReducer,
        order: orderReducer,
        admin: adminReducer,
        ui: uiReducer
    }
});