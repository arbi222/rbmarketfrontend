import { useState } from "react";
import "./settingsSections.css";
import SettingsHolder from "../SettingsHolder/settingsHolder";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../redux/api/axios";
import { useDispatch } from "react-redux";
import { updateStripeAccount } from "../../redux/features/userSlice";

const SettingsSections = () => {

    const [activeBtn, setActiveBtn] = useState("info");
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const section = params.get("section");
        const paymentFailedRedirect = params.get("failed");
        const withdrawAccount = params.get("withdrawAccount");

        if (section === "security") {
          setActiveBtn("security");
        }
        if (section === "payment"){
          setActiveBtn("payment");
        }
        if (paymentFailedRedirect === "true"){
          toast.error("Payment cancelled or invalid!")
        }
        if (withdrawAccount === "true"){
          const checkAccount = async () => {
            try{
              const res = await axiosInstance.get("/pay/account-status");
              if (res.data.payoutsEnabled){
                dispatch(updateStripeAccount(true));
                toast.success("Your payout account is now active and you can try to withdraw your wallet!");
              }
              else if (!res.data.detailsSubmitted){
                toast.warning("Please complete your account setup to enable payouts.");
              }
            }
            catch(err){
              toast.error("Failed to verify stripe account status.");
            }
          }
          checkAccount();
        }

        if (paymentFailedRedirect === "true" || withdrawAccount === "true"){
          params.delete("withdrawAccount");
          params.delete("failed");
          window.history.replaceState({}, "", `${window.location.pathname}?section=payment`);
        }
    }, []);

    return (
      <div className="settings-sections">
          <div className="left-side-setting-sections">
            <div className="left-side-setting-child">
              <p>Personal Info</p>
              <button className={activeBtn === "info" ? "active" : ""}
                      onClick={() => {setActiveBtn("info")}}
              >
                Personal information
              </button>
              <button className={activeBtn === "security" ? "active" : ""}
                      onClick={() => {setActiveBtn("security")}}
              >
                Security
              </button>
            </div>

            <div className="left-side-setting-child">
              <p>Payment Information</p>
              <button className={activeBtn === "payment" ? "active" : ""}
                      onClick={() => {setActiveBtn("payment")}}
              >
                Payments
              </button>
            </div>
          </div>

          <div className="right-side-setting-sections">
              <SettingsHolder menu={activeBtn} />
          </div>
      </div>
    )
}

export default SettingsSections;