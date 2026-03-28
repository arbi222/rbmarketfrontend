import { CircularProgress } from "@mui/material";
import AuthLayout from "../../components/AuthLayout/authLayout";
import "./resetPassword.css";
import { useDispatch, useSelector } from "react-redux";
import InputAuthField from "../../components/InputAuthField/inputAuthField";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../redux/features/authSlice";
import PageTitle from "../../components/PageTitle/pageTitle";

const ResetPassword = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, successMessage } = useSelector((state) => state.auth);

    const {token} = useParams();

    const [passwordValues, setPasswordValues] = useState({newPassword: "", confirmPassword: ""});
    const [errorPasswords, setErrorPasswords] = useState(false);

    useEffect(() => {
        if (successMessage) {
            navigate("/sign-in");
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorPasswords(false);

        if (passwordValues.newPassword !== passwordValues.confirmPassword){
            setErrorPasswords(true);
            return;
        }

        dispatch(resetPassword({newPassword: passwordValues.newPassword, confirmPassword: passwordValues.confirmPassword, token: token}));
    }

    return (
        <>
            <PageTitle title="Reset Password | RB Market" />
            <AuthLayout title="Reset password">
            <div className="resetPassword-form-container">
                    <form onSubmit={handleSubmit}>
                        <InputAuthField
                            label="New password" 
                            type='password'
                            id="newPassword"
                            required={true}
                            minLength="8"
                            autofocus={true}
                            disabled={loading}
                            value={passwordValues.newPassword}
                            onChange={(e) => setPasswordValues(prev => ({...prev, newPassword: e.target.value}))}
                        />
        
                        <InputAuthField
                            label="Confirm password" 
                            type='password'
                            id="confirmPassword"
                            required={true}
                            minLength="8"
                            disabled={loading}
                            value={passwordValues.confirmPassword}
                            onChange={(e) => setPasswordValues(prev => ({...prev, confirmPassword: e.target.value}))}
                        />
        
                        {errorPasswords &&
                            <div className="error-password-mismatch">
                                <p>New password and Confirm password do not match.</p>
                            </div>
                        }
                        
                        <div className="settings-btns sign-in-btn-section">
                            <button type="submit" 
                                    className={`save-settings ${loading ? "disabled-btn" : ""}`} 
                                    disabled={loading}>
                                {loading ? 
                                    <CircularProgress className="circular-loader-sign-in" size="25px" thickness="6"/> 
                                : 
                                    "Continue"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </AuthLayout> 
        </>
    )
}

export default ResetPassword;