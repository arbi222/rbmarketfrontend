import { useEffect, useState } from "react";
import EditableForm from "../../../EditableForm/editableForm";
import "./security.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { checkTFACode, deleteAccount, requestTFACode, resetMessages, setPasswordGoogle, setUserInfo, updateAccount } from "../../../../redux/features/userSlice";
import axiosInstance from "../../../../redux/api/axios";
import { performAccountDeletion } from "../../../../utils/helper";
import { closeGeneralPopUp, openGeneralPopUp } from "../../../../redux/features/uiSlice";
import GeneralPopUp from "../../../../popUps/GeneralPopUp/generalPopUp";

const Security = () => {

    const dispatch = useDispatch();
    const { userInfo, loading, error, successMessage } = useSelector((state) => state.user);
    const { generalPopUp } = useSelector((state) => state.ui);
    const [otherLoading, setOtherLoading] = useState(false);

    const [errorPasswords, setErrorPasswords] = useState(false);
    const [activeEdit, setActiveEdit] = useState(null);
    const [pendingGoogleAction, setPendingGoogleAction] = useState(false);

    const [securityData, setSecurityData] = useState({
      password: {oldPassword: "", newPassword: "", confirmPassword: ""},
      twoFa: {code: "", codeSent: false},
      account: {password: ""}
    });

    useEffect(() => {
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
    }, [error, successMessage]);

    const updatePassword = async (values) => {
        setErrorPasswords(false);

        if (values.newPassword !== values.confirmPassword){
            setErrorPasswords(true);
            return;
        }
        
        const payload = {
            userId: userInfo._id,
            ...values
        };

        try{
            if (userInfo.salt){
                await dispatch(updateAccount(payload)).unwrap();
            }
            else{
                await dispatch(setPasswordGoogle(values)).unwrap();
                dispatch(setUserInfo({...userInfo, salt: true}));
            }
            setSecurityData(prev => ({...prev, password: {oldPassword: "", newPassword: "", confirmPassword: ""}}));
            setActiveEdit(null);
        }
        catch(err){
            console.error("updating account failed", err);
        }
        finally{
            dispatch(resetMessages());
        }
    };

    const send2FACode = async () => {
        try{
            await dispatch(requestTFACode({enable2FA: !userInfo.isTwoFactorAuthOn})).unwrap();
            setSecurityData(prev => ({ ...prev, twoFa: {...prev.twoFa, codeSent: true}}));
        }
        catch (err){
            console.error("sending TFA code failed", err);
        }
        finally{
            dispatch(resetMessages());
        }
    };

    const handleCancelTFA = () => {
        setSecurityData(prev => ({ ...prev, twoFa: {...prev.twoFa, codeSent: false}}));
    }
    
    const verifyCode = async (values) => {
        try{
            await dispatch(checkTFACode({enable2FA: !userInfo.isTwoFactorAuthOn, TFACode: values.code})).unwrap();
            if (userInfo.isTwoFactorAuthOn){
                dispatch(setUserInfo({...userInfo, isTwoFactorAuthOn: false}));
            }
            else{
                dispatch(setUserInfo({...userInfo, isTwoFactorAuthOn: true}));
            }
            setSecurityData(prev => ({ ...prev, twoFa: {code: "", codeSent: false}}));
            setActiveEdit(null);
        }
        catch (err){
            console.error("checking TFA failed", err);
        }
        finally{
            dispatch(resetMessages());
        }
    };

    const handleGoogleLink = async () => {
        try {
          if (userInfo.googleId) {
            if (!userInfo.salt){
                setActiveEdit("password");
                setPendingGoogleAction(true);
                return;
            }

            const requiredFields = {
                userId: userInfo._id,
                googleId: null
            }

            await dispatch(updateAccount(requiredFields)).unwrap();
            dispatch(setUserInfo({...userInfo, googleId: false}));
            setActiveEdit(null);
          } 
          else {
            window.location.href = `${import.meta.env.VITE_BACKEND_URL_API}/auth/google?link=true`; 
          }
        } 
        catch (err) {
            console.error("Failed to operate with google", err);
        }
        finally{
            dispatch(resetMessages());
        } 
    };

    useEffect(() => {
        if (pendingGoogleAction && !activeEdit) {
            setActiveEdit("google");
            setPendingGoogleAction(false);
        }
    }, [activeEdit, pendingGoogleAction]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleLinked = params.get("googleLinked");
        const deleteSuccess = params.get("deleteSuccess");
        const errorCode = params.get("code");
        const authFailed = params.get("authFailed");

        if (googleLinked === "true") {
            toast.success("Account was successfully linked to your Google account.");
            dispatch(setUserInfo({...userInfo, googleId: true}));
        }

        if (authFailed === "true"){
            toast.error("Authentication with google failed!");
        }

        if (deleteSuccess === "true"){
            const handleGoogleAccountDelete = async () => {
                try{
                    if (userInfo.walletBalance > 0){
                        toast.error("Please withdraw your remaining wallet balance before deleting your account.");
                        return;
                    }

                    if (userInfo.isAdmin){
                        toast.error("Admin can not delete its own account.");
                        return;
                    }

                    if (userInfo.googleId){
                        setOtherLoading(true);
                        dispatch(openGeneralPopUp("DeleteAccountLoading"));
                        await performAccountDeletion(userInfo.slug, userInfo?.avatarFilePath);
                        await axiosInstance.delete("/user/deleteAccount/google", {data: {googleId: userInfo.googleId}});
                        window.location.href = `/sign-in?accountDeleted=true`; 
                    }
                }
                catch(err){
                    console.error(err);
                    if (err.response.data.status === 403){
                        toast.error(err.response.data.message);
                    }
                    else{
                        toast.error("Account failed to be deleted.");
                    }
                }
                finally{
                    dispatch(closeGeneralPopUp());
                    setOtherLoading(false);
                }
            }
            handleGoogleAccountDelete();
        }

        if (errorCode === "GOOGLE_ID_MISMATCH"){
            toast.error("Selected Google account does not have a googleId or does not exist.");
        }
        else if (errorCode === "DELETE_ACCOUNT_MISMATCH"){
            toast.error("The google account you have selected is not your current logged in account that you are trying to delete.");
        }
        else if (errorCode === "GOOGLE_ACCOUNT_IN_USE"){
            toast.error("Selected Google account is already in use by another account on RB Market.");
        }
        else if (errorCode === "LINK_EMAIL_MISMATCH"){
            toast.error("Selected Google account email is different from the email of your account.");
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);
    }, []);

    const handleDeleteAccount = async (values) => {
        if (userInfo.salt){
            try{
                setOtherLoading(true);
                const requiredFields = {
                    userId: userInfo._id,
                    password: values.password,
                    slug: userInfo.slug,
                    avatarFilePath: userInfo?.avatarFilePath
                }
                
                await axiosInstance.post("/user/verify-password", {password: requiredFields.password});
                await performAccountDeletion(requiredFields.slug, requiredFields.avatarFilePath);
                await dispatch(deleteAccount({userId: requiredFields.userId, password: requiredFields.password})).unwrap();
                setSecurityData(prev => ({...prev, account: {password: ""}}));
                setActiveEdit(null);
                setOtherLoading(false);
                window.location.href = `/sign-in?accountDeleted=true`; 
            }
            catch (err){
                if (err?.response?.data?.verified === false){
                    toast.error("Password is incorrect.");
                }
                console.error("Failed to delete account", err);
            }
            finally{
                dispatch(resetMessages());
                setOtherLoading(false);
            } 
        }
        else{
            window.location.href = `${import.meta.env.VITE_BACKEND_URL_API}/auth/google?deleteAccount=true`; 
        }
    }

    return (
      <>
        <EditableForm 
            mainLabel="Password"
            values={securityData.password}
            editBtn={activeEdit === "password"}
            setEditBtn={(value) => setActiveEdit(value ? "password" : null)}
            onSubmit={(values) => updatePassword(values)}
            fields={[
                ...(userInfo.salt ?
                    [{name: "oldPassword", type: "password", required: true, minLength: "8", placeholder: "Old password"}]
                    :
                    []
                ),
                {name: "newPassword", type: "password", required: true, minLength: "8", placeholder: "New password"},
                {name: "confirmPassword", type: "password", required: true, minLength: "8", placeholder: "Confirm password"}
            ]}
            extraContent={() => (
                errorPasswords &&
                    <div className="error-password-mismatch pass-change-mismatch">
                        <p>New password and Confirm password do not match.</p>
                    </div>  
            )}
            loading={loading}
            disableEditBtns={activeEdit !== null}
            conditionalExtra={() => (
                <div className="setting-label-info">
                    <label>Create a password or modify your existing one.</label>
                </div>
            )}
        />
        <EditableForm 
            mainLabel="Two-factor verification"
            values={securityData.twoFa}
            editBtn={activeEdit === "2fa"}
            setEditBtn={(value) => setActiveEdit(value ? "2fa" : null)}
            onCancel={handleCancelTFA}
            onSubmit={securityData.twoFa.codeSent ? (values) => verifyCode(values) : send2FACode}
            submitBtnText={securityData.twoFa.codeSent ? 
                           userInfo.isTwoFactorAuthOn ? "Deactivate" : "Activate"
                           : "Send email"}
            extraContent={(editValues, setEditValues) => (
                <div className="extra-content-container">
                    {securityData.twoFa.codeSent ?
                        <>
                          <p>Check your email for the verification code.</p>
                          <input
                            type="text"
                            required
                            minLength="8"
                            maxLength="8"
                            className={loading ? "disabled-btn" : ""}
                            disabled={loading}
                            placeholder="Enter code"
                            value={editValues.code}
                            onChange={(e) => setEditValues(prev => ({...prev, code: e.target.value}))}
                          />
                        </>
                    :
                    <p>
                        {userInfo.isTwoFactorAuthOn ? "Turn off 2-factor verification." : "Turn on 2-factor verification."}
                    </p>
                    }
                </div>
            )}
            loading={loading}
            disableEditBtns={activeEdit !== null}
            conditionalExtra={() => (
                <div className="setting-label-info">
                    <label>
                        {userInfo.isTwoFactorAuthOn ? 
                            "Two-factor verification is active on your account."
                        : 
                            "Protect your account by adding an extra layer of security."
                        }
                    </label>
                </div>
            )}
        />
        <EditableForm 
            mainLabel="Google"
            editBtn={activeEdit === "google"}
            setEditBtn={(value) => setActiveEdit(value ? "google" : null)}
            submitBtnText={userInfo.googleId ? 
                            userInfo.salt ?
                            "Unlink" : "Set password"
                            : "Link"}
            onSubmit={handleGoogleLink}
            extraContent={() => (
                <div className="extra-content-container">
                    <p>
                        {userInfo.googleId ? 
                            userInfo.salt ?
                            "Unlink Google account." : "Set a password before unlinking your Google account."
                        : "Link with your Google account."
                        }
                    </p>
                </div>
            )}
            loading={loading}
            disableEditBtns={activeEdit !== null}
            conditionalExtra={() => (
                <div className="setting-label-info">
                    <label>
                        {userInfo.googleId ? 
                            "Your account is already linked with google."
                        :
                            "Link your account with google for faster sign in and checkout."
                        }
                    </label>
                </div>
            )}
        />
        {!userInfo.isAdmin &&
            <EditableForm 
                mainLabel="Account"
                editBtn={activeEdit === "account"}
                setEditBtn={(value) => setActiveEdit(value ? "account" : null)}
                submitBtnText={userInfo.salt ? "Delete account" : "Verify & Delete"}
                values={securityData.account}
                onSubmit={(values) => handleDeleteAccount(values)}
                fields={[
                    ...(userInfo.salt ?
                        [{name: "password", type: "password", required: true, minLength: "8", placeholder: "Password"},]
                        :
                        []
                    ),
                ]}
                extraContent={() => (
                    !userInfo.salt &&
                        <div className="extra-content-container">
                            <p>
                                Your account doesn’t have a password. To delete your account, please verify your identity with Google.
                            </p>
                        </div>
                )}
                loading={loading || otherLoading}
                disableEditBtns={activeEdit !== null}
                conditionalExtra={() => (
                    <div className="setting-label-info">
                        <label>
                            Delete your account permanently.
                        </label>
                    </div>
                )}
            />
        }

        {generalPopUp === "DeleteAccountLoading" && 
            <GeneralPopUp usage="DeleteAccountLoading"
                  showLastBtns={false}
                  loading={loading || otherLoading} 
            />  
        }
      </>
    )
}

export default Security;