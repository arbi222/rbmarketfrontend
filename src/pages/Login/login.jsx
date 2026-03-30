import { CircularProgress } from '@mui/material';
import "./login.css";
import { useEffect, useState } from "react";
import AuthLayout from "../../components/AuthLayout/authLayout";
import InputAuthField from '../../components/InputAuthField/inputAuthField';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, verify2FA, requestPasswordReset, reset2FAState, resetError, resetBannedStatus } from "../../redux/features/authSlice";
import { openGeneralPopUp, closeGeneralPopUp } from '../../redux/features/uiSlice';
import { toast } from 'react-toastify';
import googleIcon from "../../../public/assets/google.png";
import GeneralPopUp from '../../popUps/GeneralPopUp/generalPopUp';
import { redirectAfterLogin } from '../../utils/helper';
import PageTitle from '../../components/PageTitle/pageTitle';

const Login = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { error, loading, tempUserEmail, requires2FA, statusReason } = useSelector((state) => state.auth);
    const generalPopUp = useSelector((state) => state.ui.generalPopUp);

    const [reason, setReason] = useState("");

    const [loginValues, setLoginValues] = useState({email: "", password: ""});
    const [forgotPass, setForgotPass] = useState(false);
    const [authCode, setAuthCode] = useState("");

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (requires2FA) {
            dispatch(openGeneralPopUp("TFA"));
        }
    }, [requires2FA]);

    console.log(generalPopUp)

    useEffect(() => {
        if (statusReason) {
            dispatch(openGeneralPopUp("BannedAccount"));
        }
    }, [statusReason]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!forgotPass){
            try{
                await dispatch(loginUser(loginValues)).unwrap();
                redirectAfterLogin(navigate, location);
            }
            catch(err){
                console.error(err);
            }  
        }
        else{
            try {
              await dispatch(requestPasswordReset({email: loginValues.email})).unwrap();
              setForgotPass(false);
              setLoginValues(prev => ({...prev, password: ""}));
            } catch (err) {
              console.error("Password reset request failed");
            }
        }
    }

    const handleGoogleLogin = () => {
        const redirectState = {
          from: location.state?.from || "/",
          scrollTo: location.state?.scrollTo || "",
          cartPopUp: location.state?.cartPopUp || false,
          notificationPopUp: location.state?.notificationPopUp || false,
          cartPopUpPhone: location.state?.cartPopUpPhone || false,
          notificationPopUpPhone: location.state?.notificationPopUpPhone || false,
        };
        
        sessionStorage.setItem(
          "postAuthRedirect",
          JSON.stringify(redirectState)
        );
        
        window.location.href = `${import.meta.env.VITE_BACKEND_URL_API}/auth/google`; 
    }

    const handleTFA = async () => {
        if (authCode !== ""){
            try{
                await dispatch(verify2FA({email: tempUserEmail, authCode: authCode})).unwrap();
                dispatch(closeGeneralPopUp());
                redirectAfterLogin(navigate, location);
            }
            catch(err){
                console.error(err);
            }
        }
        else{
            toast.error("The auth code field is empty.");
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accountDeleted = params.get("accountDeleted");
        const authFailed = params.get("authFailed");
        const loginBlocked = params.get("loginBlocked");
        const cancelled = params.get("cancelled")
        const message = params.get("message");
        const reason = params.get("reason");

        if (cancelled === "true"){
            toast.warn("You have cancelled authentication with google.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (accountDeleted === "true"){
            toast.success("Account has been deleted.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (authFailed === "true"){
            toast.error("Failed to authenticate with google.");
            window.history.replaceState({}, document.title, window.location.pathname);
        } 
        
        if (loginBlocked === "true"){
            dispatch(openGeneralPopUp("BannedAccount"));
            setReason(decodeURIComponent(reason));
            toast.error(decodeURIComponent(message));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);
    
    return (
        <>
            <PageTitle title="Sign In | RB Market" />
            <AuthLayout title={forgotPass ? "Reset your password" : "Sign in to your account"}>
                {!forgotPass &&
                    <p className="login-p-tag">
                        New to RB Market?
                        <Link to="/sign-up" state={location.state}>
                            <button type="button"
                                className={loading ? "disabled-btn" : ""} 
                                disabled={loading}
                                onClick={() => dispatch(resetError())}
                            >
                                Create account
                            </button>
                        </Link>
                    </p>
                }

                <div className="login-form-container">
                    <form onSubmit={handleSubmit}>
                        <InputAuthField
                            label="Email" 
                            type='email'
                            id="email"
                            required={true}
                            autofocus={true}
                            disabled={loading}
                            value={loginValues.email}
                            onChange={(e) => setLoginValues(prev => ({...prev, email: e.target.value}))}
                        />

                        {!forgotPass && 
                            <InputAuthField
                                label="Password" 
                                type='password'
                                id="password"
                                minLength="8"
                                required={true}
                                disabled={loading}
                                value={loginValues.password}
                                onChange={(e) => setLoginValues(prev => ({...prev, password: e.target.value}))}
                            />
                        }

                        <p className="login-p-tag">
                            {!forgotPass && "Forgot password?"}
                            <button type="button"
                                    className={loading ? "disabled-btn" : ""} 
                                    disabled={loading}
                                    onClick={() => setForgotPass(!forgotPass)}
                            >
                                {forgotPass ? "Back to Sign-in" : "Reset it now"}
                            </button>
                        </p>
                    
                        <div className="settings-btns sign-in-btn-section">
                            <button type="submit" 
                                    className={`save-settings ${loading ? "disabled-btn" : ""}`} 
                                    disabled={loading}>
                                {loading ? 
                                    <CircularProgress className="circular-loader-sign-in" size="25px" thickness="6"/> 
                                : 
                                    forgotPass ? 
                                    "Send email"  
                                    :
                                    "Sign in"
                                }
                            </button>
                        </div>
                    </form>
                            
                    {!forgotPass && 
                        <>
                            <div className="divider">
                                <span className="divider-text">or</span>
                            </div>

                            <div className="settings-btns sign-in-btn-section">
                                <button type="button" 
                                        className={`save-settings google-btn-login ${loading ? "disabled-btn" : ""}`} 
                                        disabled={loading}
                                        onClick={handleGoogleLogin}
                                >
                                    <img src={googleIcon} alt="google" />
                                    <span>Continue with Google</span>
                                </button>
                            </div>
                        </>
                    }   
                </div> 

                {generalPopUp === "BannedAccount" &&
                    <GeneralPopUp usage="BannedAccount"
                                closePopUp={() => {dispatch(closeGeneralPopUp()); dispatch(resetBannedStatus())}}
                                content={() => (
                                    <div className='banned-account-message'>
                                        <p><span>Explanation:</span> {statusReason || reason}</p>
                                        <p className='support-email'>For more info, contact the support <Link to={`mailto:${import.meta.env.VITE_PLATFORM_EMAIL}`}>@{import.meta.env.VITE_PLATFORM_EMAIL}</Link></p>
                                    </div>
                                )}
                                showLastBtns={false}
                    />
                }
                
                {generalPopUp === "TFA" &&
                    <GeneralPopUp usage="TFA"
                                loading={loading}
                                content={() => (
                                    <InputAuthField
                                        label="Auth code" 
                                        type='text'
                                        id="Auth-code"
                                        autofocus={true}
                                        maxLength="8"
                                        disabled={loading}
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !loading && authCode !== "" && authCode.length === 8){
                                                handleTFA();
                                            }
                                        }}
                                    />
                                )}
                                onCancel={() => {dispatch(closeGeneralPopUp()); dispatch(reset2FAState())}}
                                onSave={handleTFA}
                                showLastBtns={true}
                                cancelBtnText = "Back" 
                                saveBtnText = "Send code"
                                disabledSaveBtn={authCode === "" || authCode.length !== 8}
                    />
                }
            </AuthLayout>
        </> 
    )
}

export default Login;