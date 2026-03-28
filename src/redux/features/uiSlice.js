import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    generalPopUp: false,
    editProfile: false,
    aboutBio: "",
    fundValue: null,
    insufficientValue: 0,
    paymentFrom: "",
    paymentOptionChoosen: null,
    orderId: null,
    amountValue: 0
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openGeneralPopUp: (state, action) => {
            if (action){
                state.generalPopUp = action.payload;
            }
            else{
                state.generalPopUp = true;
            }
        },
        closeGeneralPopUp: (state) => {
            state.generalPopUp = false;
        },
        startEditingProfile: (state) => {
            state.editProfile = true;
        },
        exitEditingProfile: (state) => {
            state.editProfile = false;
        },
        setAboutBio: (state, action) => {
            state.aboutBio = action.payload;
        },
        setFundValue: (state, action) => {
            state.fundValue = action.payload;
        },
        setAmountValue: (state, action) => {
            state.amountValue = action.payload;
        },
        setinsufficientValue: (state, action) => {
            state.insufficientValue = action.payload;
        },
        clearInsufficientValue: (state) => {
            state.insufficientValue = 0;
        },
        setPaymentFrom: (state, action) => {
            state.paymentFrom = action.payload;
        },
        setPaymentOptionChoosen: (state, action) => {
            state.paymentOptionChoosen = action.payload;
        },
        setOrderId: (state, action) => {
            state.orderId = action.payload;
        },
    }
});

export const { openGeneralPopUp, closeGeneralPopUp, startEditingProfile, exitEditingProfile, 
        setAboutBio, setFundValue, setPaymentFrom, setinsufficientValue, clearInsufficientValue, 
        setPaymentOptionChoosen, setOrderId, setAmountValue } = uiSlice.actions;
export default uiSlice.reducer;