import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mergeGuestCartIfExists } from "../../utils/helper";
import axiosInstance from "../api/axios";

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;

        try{
            const res = await axiosInstance.get("/user/me");

            dispatch({
                type: "user/setUserInfo",
                payload: res.data
            });

            return res.data;
        }
        catch (err){
            return rejectWithValue(err.response?.data?.message || "Not authenticated");
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;

        try{
            const res = await axiosInstance.post("/auth/register", userData);

            dispatch({
                type: "user/setUserInfo",
                payload: res.data.user
            });

            mergeGuestCartIfExists(dispatch);

            return res.data;
        }
        catch (err){
            return rejectWithValue(err.response?.data?.message || "Register failed");
        }
    }
)

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;

        try{
            const res = await axiosInstance.post("/auth/login", credentials);

            if (res.data.isTwoFactorAuthOn){
                const TFAres = await axiosInstance.post("/TFA/sendAuthCode", {email: res.data.email});

                return rejectWithValue({
                    requires2FA: true,
                    tempUserEmail: res.data.email,
                    successMessage: TFAres.data.message
                });
            }

            dispatch({
                type: "user/setUserInfo",
                payload: res.data.user
            });

            mergeGuestCartIfExists(dispatch);

            return res.data;
        }
        catch (err){
            return rejectWithValue(err.response?.data || "Login failed");
        }
    }
)

export const verify2FA = createAsyncThunk(
    "auth/verify2FA",
    async ({email, authCode}, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;

        try{
            const res = await axiosInstance.post("/TFA/verifyAuthCode", {email, authCode});

            dispatch({
                type: "user/setUserInfo",
                payload: res.data.user
            });

            mergeGuestCartIfExists(dispatch);

            return res.data;
        }
        catch (err){
            return rejectWithValue(err.response?.data?.message || "2FA verification failed");
        }
    }
)

export const requestPasswordReset = createAsyncThunk(
    "auth/requestPasswordReset",
    async ({email}, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/password/forgotPassword", {email});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Password reset request failed");
        }
    }
)

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async ({newPassword, confirmPassword, token}, thunkAPI) => {
        try{
            const res = await axiosInstance.post(`/password/resetPassword/${token}`, {newPassword: newPassword, confirmPassword: confirmPassword});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Password reset failed");
        }
    }
)

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.get("/auth/logout");
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Logout failed");
        }
    }
)

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
  state.successMessage = null;
  state.requires2FA = false;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.userInfo = action.payload.user;
  state.successMessage = action.payload.message;
  state.isAuthenticated = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isAuthenticated = false;
};

const initialState = {
    userInfo: null,
    isAuthenticated: false,
    statusReason: null,
    loading: false,
    error: null,
    successMessage: null,
    isAuthChecked: false,
    requires2FA: false,
    tempUserEmail: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset2FAState: (state) => {
            state.requires2FA = false;
            state.tempUserEmail = null;
        },
        resetBannedStatus: (state) => {
            state.statusReason = null;
        },
        resetError: (state) => {
            state.error = null;
        },
        resetSuccess: (state) => {
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetching user to keep it login on refresh pages
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.isAuthChecked = false;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
                state.isAuthChecked = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.userInfo = null;
                state.isAuthChecked = true;
            })
            // register
            .addCase(registerUser.pending, handlePending)
            .addCase(registerUser.fulfilled, handleFulfilled)
            .addCase(registerUser.rejected, handleRejected)
            // login
            .addCase(loginUser.pending, handlePending)
            .addCase(loginUser.fulfilled, handleFulfilled)
            .addCase(loginUser.rejected, (state, action) => {
                if (action.payload?.requires2FA){
                    state.requires2FA = true;
                    state.tempUserEmail = action.payload.tempUserEmail;
                    state.successMessage = action.payload.successMessage;
                    state.loading = false;
                    state.error = null;
                }
                else{
                    state.loading = false;
                    state.statusReason = action.payload?.statusReason;
                    state.error = action.payload.message;
                    state.isAuthenticated = false;
                }
            })
            // verify 2-factor-auth code
            .addCase(verify2FA.pending, handlePending)
            .addCase(verify2FA.fulfilled, (state, action) => {
                state.userInfo = action.payload.user;
                state.successMessage = action.payload.message;
                state.isAuthenticated = true;
                state.requires2FA = false;
                state.tempUserEmail = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(verify2FA.rejected, handleRejected)
            // requesting a password reset
            .addCase(requestPasswordReset.pending, handlePending)
            .addCase(requestPasswordReset.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(requestPasswordReset.rejected, handleRejected)
            // reseting password
            .addCase(resetPassword.pending, handlePending)
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.successMessage = action.payload.message;
            })
            .addCase(resetPassword.rejected, handleRejected)
            // logout
            .addCase(logoutUser.pending, handlePending)
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.userInfo = null;
                state.isAuthenticated = false;
                state.error = null;
                state.loading = false;
                state.requires2FA = false;
                state.tempUserEmail = null;
                state.successMessage = action.payload.message;
            })
            .addCase(logoutUser.rejected, (state, action) => {
              state.error = action.payload;
            })
    }
});

export const { reset2FAState, resetError, resetSuccess, resetBannedStatus } = authSlice.actions;
export default authSlice.reducer;