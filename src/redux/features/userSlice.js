import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logoutUser } from "./authSlice";
import axiosInstance from "../api/axios";


export const getUserPublicData = createAsyncThunk(
    "user/getUserPublicData",
    async ({slug}, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/user/${slug}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update account");
        }
    }
)

export const updateAccount = createAsyncThunk(
    "user/updateAccount",
    async (userData, thunkAPI) => {
        try{
            const res = await axiosInstance.put(`/user/${userData.userId}`, userData);
            return {...res.data, ...userData?.aboutBio, ...userData?.admin};
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update account");
        }
    }
)

export const requestTFACode = createAsyncThunk(
    "user/requestTFACode",
    async ({enable2FA}, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/TFA/requestTFACode", {enable2FA: enable2FA});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to send TFA code");
        }
    }
)

export const checkTFACode = createAsyncThunk(
    "user/checkTFACode",
    async ({enable2FA, TFACode}, thunkAPI) => {
        try{
            const res = await axiosInstance.post("/TFA/checkTFA", {enable2FA: enable2FA, TFACode: TFACode});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to check TFA code");
        }
    }
)

export const setPasswordGoogle = createAsyncThunk(
    "user/setPasswordGoogle",
    async (userData, thunkAPI) => {
        try{
            const res = await axiosInstance.post(`/password/setPasswordGoogle`, userData);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to set password");
        }
    }
)

export const sendEmailVerification = createAsyncThunk(
    "user/sendEmailVerification",
    async (_, thunkAPI) => {
        try{
            const res = await axiosInstance.post(`/emailVerification/sendEmail`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to send email");
        }
    }
)

export const checkEmailVerificationToken = createAsyncThunk(
    "user/checkEmailVerificationToken",
    async (token, thunkAPI) => {
        try{
            const res = await axiosInstance.get(`/emailVerification/verifyEmail/${token}`);
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to verify email");
        }
    }
)

export const deleteAccount = createAsyncThunk(
    "user/deleteAccount",
    async (userData, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(`/user/${userData.userId}`, {data: userData});
            return res.data;
        }
        catch (err){
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete account");
        }
    }
)

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
  state.successMessage = null;
};

const handleFulfilled = (state, action) => {
  state.loading = false;
  state.emailLoading = false;
  state.successMessage = action.payload.message;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.emailLoading = false;
  state.error = action.payload;
};

const initialState = {
    userInfo: {},
    otherUserInfo: null,
    isFetchingChecked: false,
    loading: false,
    emailLoading: false,
    error: null,
    successMessage: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        },
        setEmailStatus: (state) => {
            state.userInfo.isEmailVerified = true;
            state.userInfo.verifyEmailToken = undefined;
        },
        setEmailToken: (state) => {
            state.userInfo.verifyEmailToken = true;
        },
        decreaseWallet: (state, action) => {
            state.userInfo.walletBalance -= action.payload;
        },
        increaseWallet: (state, action) => {
            state.userInfo.walletBalance += action.payload;
        },
        setWallet: (state, action) => {
            state.userInfo.walletBalance = action.payload;
        },
        updateStripeAccount: (state, action) => {
            state.userInfo.stripeAccountId = action.payload;
        },
        resetOtherUser: (state) => {
            state.otherUserInfo = null;
        },
        resetMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // get user's public data
        .addCase(getUserPublicData.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
            state.isFetchingChecked = false;
        })
        .addCase(getUserPublicData.fulfilled, (state, action) => {
            state.loading = false;
            state.otherUserInfo = action.payload.user;
            state.error = null;
            state.isFetchingChecked = true;
        })
        .addCase(getUserPublicData.rejected, (state, action) => {
            state.loading = false;
            state.otherUserInfo = null;
            state.error = action.payload;
            state.isFetchingChecked = true;
        })
        // update profile
        .addCase(updateAccount.pending, handlePending)
        .addCase(updateAccount.fulfilled, (state, action) => {
            if (action.payload.aboutBio && !action.payload.admin){
                state.userInfo.aboutBio = action.payload.aboutBio;
            }
            handleFulfilled(state, action);
        })
        .addCase(updateAccount.rejected, handleRejected)
        // request TFACode
        .addCase(requestTFACode.pending, handlePending)
        .addCase(requestTFACode.fulfilled, handleFulfilled)
        .addCase(requestTFACode.rejected, handleRejected)
        // check TFACode
        .addCase(checkTFACode.pending, handlePending)
        .addCase(checkTFACode.fulfilled, handleFulfilled)
        .addCase(checkTFACode.rejected, handleRejected)
        // set Password for users who login with google auth
        .addCase(setPasswordGoogle.pending, handlePending)
        .addCase(setPasswordGoogle.fulfilled, handleFulfilled)
        .addCase(setPasswordGoogle.rejected, handleRejected)
        // send email verification
        .addCase(sendEmailVerification.pending, (state) => {
            state.emailLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        .addCase(sendEmailVerification.fulfilled, handleFulfilled)
        .addCase(sendEmailVerification.rejected, handleRejected)
        // verify email token
        .addCase(checkEmailVerificationToken.pending, (state) => {
            state.emailLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        .addCase(checkEmailVerificationToken.fulfilled, handleFulfilled)
        .addCase(checkEmailVerificationToken.rejected, handleRejected)
        // delete account
        .addCase(deleteAccount.pending, handlePending)
        .addCase(deleteAccount.fulfilled, handleFulfilled)
        .addCase(deleteAccount.rejected, handleRejected)
        // logout user state clearing
        .addCase(logoutUser.fulfilled, (state) => {
            state.userInfo = {};
            state.error = null;
            state.loading = false;
            state.successMessage = null;
        })
    }
});

export const { setUserInfo, resetMessages, setEmailStatus, setEmailToken, 
            resetOtherUser, decreaseWallet, increaseWallet, updateStripeAccount, setWallet } = userSlice.actions;
export default userSlice.reducer;