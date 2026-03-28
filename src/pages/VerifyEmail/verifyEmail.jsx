import "./verifyEmail.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import { checkEmailVerificationToken, resetMessages, setEmailStatus } from "../../redux/features/userSlice";
import { CircularProgress } from "@mui/material";
import PageTitle from "../../components/PageTitle/pageTitle";

const VerifyEmail = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, successMessage, emailLoading } = useSelector((state) => state.user);

    const {token} = useParams();

    const handleEmailVerification = async () => {
        try{
            await dispatch(checkEmailVerificationToken(token)).unwrap();
        }
        catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        handleEmailVerification();
    }, [token])

    useEffect(() => {
        if (successMessage) {
            toast.info("You will be redirected to homepage in 3 seconds.");
            dispatch(setEmailStatus());
            setTimeout(() => {
                navigate("/");
                dispatch(resetMessages());
            }, 3200);
        }
    }, [successMessage]);

    return (
      <>
        <PageTitle title="Verify Email | RB Market" />
        <div className="market-logo">
            <MarketLogo />
        </div>

        <div className="email-verify-message">
            {emailLoading ? 
                <div className="loading-email-loader">
                    <CircularProgress size={40} thickness={5} />
                </div>
                :
                <>
                    {error &&
                        <p className="error-email-message">{error}</p>
                    }
                    {successMessage && 
                        <p className="success-verification-email">{successMessage}</p>
                    }
                </>
            }
        </div>
      </>
    )
}

export default VerifyEmail;