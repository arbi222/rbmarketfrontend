import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axiosInstance from "../../../redux/api/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { closeGeneralPopUp, setFundValue, setOrderId, setPaymentOptionChoosen } from "../../../redux/features/uiSlice";
import { increaseWallet } from "../../../redux/features/userSlice";
import { setSingleOrder } from "../../../redux/features/ordersSlice";

export default function PayPalDeposit({fundValue, orderId, setPaypalChoosen, setPaymentOption}) {

  const dispatch = useDispatch();
  const [rbmarketOrderId, setRBMarketOrderId] = useState(null);
  const [oldOrder, setOldOrder] = useState(null);

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD"
      }}
    >
      <PayPalButtons
        createOrder={async () => {
          try {
            const res = await axiosInstance.post("/payment/create-order", {fundValue, orderId});
            setRBMarketOrderId(res.data.rbmarketOrderId);
            if (res.data.oldOrder){
              dispatch(setSingleOrder(res.data.oldOrder));
              setOldOrder(res.data.oldOrder);      
            }
            return res.data.id;
          } catch (err) {
            console.error("Create order failed:", err);
            if (err?.response?.data?.code === "ACCOUNT-STATUS"){
              toast.error(err.response.data?.message);
            }
            if (err?.response?.data?.code === "EMAIL-VERIFICATION"){
              toast.error(err.response.data?.message);
            }
            toast.error("Could not create PayPal order");

          }
        }}
        onApprove={async (data) => {
          try {
            const res = await axiosInstance.post("/payment/capture-order", {orderId: data.orderID, rbmarketOrderId: rbmarketOrderId});
            if (res.data.status === "COMPLETED") {
              dispatch(closeGeneralPopUp());
              setPaypalChoosen(false);
              setPaymentOption(null);
              const amountInCents = Math.round(parseFloat(res.data.purchase_units[0].payments.captures[0].amount.value * 100));
              dispatch(increaseWallet(amountInCents));
              if (oldOrder){
                dispatch(setPaymentOptionChoosen(null));
                dispatch(setOrderId(null));
                dispatch(setFundValue(null));
                toast.warn("Old order expired. Created new order and finalised it.");
              }
              toast.success("Funds added successfully!");
            }
          } catch (err) {
            console.error("Capture order failed:", err);
            if (err?.response?.data?.code === "ACCOUNT-STATUS"){
              toast.error(err.response.data?.message);
            }
            if (err?.response?.data?.code === "EMAIL-VERIFICATION"){
              toast.error(err.response.data?.message);
            }
            toast.error("Payment failed");
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          toast.error("Payment error");
        }}
      />
    </PayPalScriptProvider>
  );
}