import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GeneralPopUp from "../../../popUps/GeneralPopUp/generalPopUp";
import { closeGeneralPopUp, setAmountValue, setOrderId, setPaymentOptionChoosen } from "../../../redux/features/uiSlice";
import AddingFunds from "../../AddingFunds/addingFunds";
import PaymentLayout from "../PaymentLayout/paymentLayout";
import axiosInstance from "../../../redux/api/axios";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { decreaseWallet } from "../../../redux/features/userSlice";
import PayPalDeposit from "../Paypal/paypal";
import { CircularProgress } from "@mui/material";
import { setSingleOrder } from "../../../redux/features/ordersSlice";


const PayMethodAction = ({from}) => {

    const dispatch = useDispatch();
    const {generalPopUp, fundValue, paymentFrom, paymentOptionChoosen, orderId, amountValue} = useSelector((state) => state.ui);
    const {userInfo} = useSelector((state) => state.user);
    const [paymentOption, setPaymentOption] = useState(null);
    const [paypalChoosen, setPaypalChoosen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [disabledStripe, setDisabledStripe] = useState(false);
    const [disabledPaypal, setDisabledPaypal] = useState(false);
    const [amountDisabled, setAmountDisabled] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const successPayment = searchParams.get("paymentSuccess");

    useEffect(() => {
        if (successPayment === "true"){
            toast.success("Top-up successful!");
            searchParams.delete("paymentSuccess");
            setSearchParams(searchParams);
        }
    }, [successPayment])

    useEffect(() => {
        if (paymentOptionChoosen === "paypal"){
            setPaymentOption("paypal");
            setPaypalChoosen(true);
            setDisabledStripe(true);
            setAmountDisabled(true);
        }
        else if (paymentOptionChoosen === "stripe"){
            setPaymentOption("stripe");
            setDisabledPaypal(true);
            setAmountDisabled(true);
        }
        else{
            setPaymentOption(null);
            setPaypalChoosen(false);
            setDisabledPaypal(false);
            setDisabledStripe(false);
            setAmountDisabled(false);
        }
    }, [paymentOptionChoosen])

    const handlePay = async () => {
        if (!paymentOption) return;
        if (userInfo.isAdmin){
            toast.error("Admin can not add funds!");
            return;
        }
        
        if (paymentOption === "stripe"){
            if (!fundValue || !paymentFrom) return;
            try{
                setLoading(true);
                const { data } = await axiosInstance.post("/pay/create-pay-session", {fundValue, paymentFrom, orderId});
                if (data.url){
                    window.location = data.url;
                }
                else{
                    toast.error("Stripe error!");
                    setLoading(false);
                }
            }
            catch(err){
                toast.error("Stripe error!");
                toast.error(err.response.data.message);
                setLoading(false);
            }
        }
        else if (paymentOption === "paypal"){
            setPaypalChoosen(true);
        }
    }

    const [stripeStatus, setStripeStatus] = useState({});
    const [stripeLoading, setStripeLoading] = useState(false);
    const [amount, setAmount] = useState(0);
    const [showAmount, setShowAmount] = useState(false);
    const [receiverEmail, setReceiverEmail] = useState("");

    useEffect(() => {
        if (amountValue){
            setAmount(amountValue);
        }
        else{
            setAmount(0);
        }
    }, [amountValue])

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { data } = await axiosInstance.get("/pay/account-status");
                setStripeStatus(data);
            } catch (err) {
                console.error(err);
            }
            finally {
                setStripeLoading(false);
            }
        };

        if (generalPopUp === "withdraw" && paymentOption === "stripe") {
            setStripeLoading(true);
            fetchStatus();
        }
    }, [generalPopUp, paymentOption]);

    useEffect(() => {
        if (!stripeLoading && paymentOption === "stripe" && stripeStatus?.payoutsEnabled) {
            setShowAmount(true);
        } 
        else {
            setShowAmount(false);
        }
    }, [paymentOption, stripeStatus, stripeLoading]);

    const handleWithdraw = async () => {
        if (!paymentOption) return;
        
        if (paymentOption === "stripe"){
            const amountInCents = Math.round(Number(amount) * 100);
            try{
                setLoading(true);
                const { data } = await axiosInstance.post("/pay/withdraw", {amount: amountInCents, orderId});
                if (data.onboardingUrl){
                    window.location = data.onboardingUrl;
                }
                else if (data.message){
                    setLoading(false);
                    dispatch(closeGeneralPopUp());
                    setPaymentOption(null);
                    setAmount(0);
                    dispatch(decreaseWallet(amountInCents));
                    toast.success(data.message);
                }

                if (data.oldOrder){
                    dispatch(setSingleOrder(data.oldOrder));
                    dispatch(closeGeneralPopUp());
                    setPaymentOption(null);
                    dispatch(setAmountValue(0));
                    dispatch(setPaymentOptionChoosen(null));
                    toast.warn("Old order expired. Created new order and finalised it.");
                }
            }
            catch(err){
                console.error(err);
                toast.error(err.response.data.message || "stripe withdraw error");
                setLoading(false);
            }
        }
        else if (paymentOption === "paypal"){
            if (Number(amount) <= 0) return toast.error("Amount needs to be positive number.");
            if (!receiverEmail) return toast.error("Please enter PayPal email");
            const amountInCents = Math.round(Number(amount) * 100);

            try{
                setLoading(true);
                const res = await axiosInstance.post("/payment/withdraw", {amount: amountInCents, receiverEmail, orderId});
                if (res.data.oldOrder){
                    dispatch(setSingleOrder(res.data.oldOrder));
                    dispatch(setPaymentOptionChoosen(null));
                    dispatch(setOrderId(null));
                    dispatch(setAmountValue(0));
                    toast.warn("Old order expired. Created new order and finalised it.");
                }
                if (res.data.message === "Withdraw successful"){
                    setLoading(false);
                    dispatch(closeGeneralPopUp());
                    setPaymentOption(null);
                    setPaypalChoosen(false);
                    setAmount(0);
                    setReceiverEmail("");
                    dispatch(decreaseWallet(amountInCents));
                    toast.success(res.data.message);
                    setLoading(false);
                }
            }
            catch(err){
                console.error(err);
                toast.error(err.response.data.message || "paypal withdraw error");
                setLoading(false);
            }
        }
    }

    return (
      <>
        {generalPopUp === "add-funds" && 
          <GeneralPopUp usage={"add-funds"} 
                      closePopUp={() => {dispatch(closeGeneralPopUp())}}
                      showLastBtns={false}
                      content={() => {
                          return (
                              <div className="add-funds-popup">
                                <AddingFunds popUp={true} from={from}/>
                              </div>
                          )
                      }}
          />
        }
        
        {generalPopUp === "payment" && 
            <GeneralPopUp usage="payment" 
                        closePopUp={() => {dispatch(closeGeneralPopUp()); setPaymentOption(null); 
                                        setPaypalChoosen(false); dispatch(setPaymentOptionChoosen(null)); 
                                        }}
                        saveBtnText="Continue"
                        cancelBtnText="Back"
                        showLastBtns={paypalChoosen ? false : true}
                        paymentOption={paymentOption}
                        onSave={handlePay}
                        loading={loading}
                        content={() => {
                            if (paypalChoosen){
                                return <PayPalDeposit fundValue={fundValue}
                                                    orderId={orderId} 
                                                    setPaypalChoosen={setPaypalChoosen} 
                                                    setPaymentOption={setPaymentOption}
                                        />
                            }
                            
                            return (
                                <PaymentLayout paymentOption={paymentOption} 
                                            setPaymentOption={setPaymentOption}
                                            paypalDisabled={disabledPaypal}
                                            stripeDisabled={disabledStripe}
                                />
                            )
                        }}
            />
        }

        {generalPopUp === "withdraw" && 
            <GeneralPopUp usage="withdraw" 
                        closePopUp={() => {dispatch(closeGeneralPopUp()); setPaymentOption(null); dispatch(setPaymentOptionChoosen(null)); dispatch(setAmountValue(0))}}
                        saveBtnText="Continue"
                        cancelBtnText="Back"
                        paymentOption={paymentOption}
                        amount={amount}
                        setAmount={setAmount}
                        showAmount={showAmount}
                        amountDisabled={amountDisabled}
                        receiverEmail={receiverEmail}
                        setReceiverEmail={setReceiverEmail}
                        onSave={handleWithdraw}
                        loading={loading}
                        disabledSaveBtn={stripeLoading}
                        content={() => 
                            <>
                                <PaymentLayout paymentOption={paymentOption} 
                                                setPaymentOption={setPaymentOption}
                                                paypalDisabled={disabledPaypal}
                                                stripeDisabled={disabledStripe}
                                />
                                {stripeLoading &&
                                    <CircularProgress size="20px"/>
                                    
                                }
                            </>
                        }
            />
        }
      </>
    )
}

export default PayMethodAction;