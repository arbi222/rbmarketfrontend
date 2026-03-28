import { useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import "./personalInfo.css";
import { CircularProgress } from '@mui/material';
import EditableForm from '../../../EditableForm/editableForm';
import { useDispatch, useSelector } from "react-redux";
import { updateAccount, resetMessages, setUserInfo, sendEmailVerification } from '../../../../redux/features/userSlice';
import { toast } from 'react-toastify';
import { capitalizeFirstLetter } from '../../../../utils/helper';

const PersonalInfo = () => {

    const dispatch = useDispatch();
    const { userInfo, loading, emailLoading, error, successMessage } = useSelector((state) => state.user);

    const [activeEdit, setActiveEdit] = useState(null);

    useEffect(() => {
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
        dispatch(resetMessages());
    }, [error, successMessage]);

    const updateData = async (key, values) => {
        const prevValues = {
            username: {firstName: userInfo.firstName, lastName: userInfo.lastName},
            contact: {email: userInfo.email, mobileNumber: userInfo.mobileNumber},
            address: {country: userInfo.country, city: userInfo.city, street: userInfo.street, postalCode: userInfo.postalCode}
        }[key];

        const changedValues = Object.fromEntries(
            Object.entries(values).filter(([k, v]) => v !== prevValues[k])
        );

        if (Object.keys(changedValues).length === 0){
            toast.info("No change was detected!");
            return;
        } 

        if (key === "username") {
            if (changedValues.firstName) {
                changedValues.firstName = capitalizeFirstLetter(changedValues.firstName);
            }
            if (changedValues.lastName) {
                changedValues.lastName = capitalizeFirstLetter(changedValues.lastName);
            }
        }

        if (key === "address") {
            for (const field of ["country", "city", "street"]) {
                if (changedValues[field]) {
                    changedValues[field] = capitalizeFirstLetter(changedValues[field]);
                }
            }
        }

        const finalFields = {
            userId: userInfo._id,
            ...changedValues
        };

        try{
            await dispatch(updateAccount(finalFields)).unwrap();
            dispatch(setUserInfo({...userInfo, ...changedValues}));
            setActiveEdit(null);
        }
        catch(err){
            console.error("updating account failed");
        }
        finally{
            dispatch(resetMessages());
        } 
    };

    const [verifyEmailBtn, setVerifyEmailBtn] = useState("Verify now");
    const handleVerifyEmail = async () => {
        try{
          await dispatch(sendEmailVerification()).unwrap();
          setVerifyEmailBtn("Email sent");
        }
        catch(err){
          console.error(err);
        }
    }

    return (
      <>
        <EditableForm 
            mainLabel="Username"
            values={{firstName: userInfo.firstName, lastName: userInfo.lastName}}
            editBtn={activeEdit === "username"}
            setEditBtn={(value) => setActiveEdit(value ? "username" : null)}
            onSubmit={(values) => updateData("username", values)}
            fields={[
                {name: "firstName", required: true, placeholder: "First name"},
                {name: "lastName", placeholder: "Last name"}
            ]}
            loading={loading}
            disableEditBtns={activeEdit !== null}
            conditionalExtra={(editValues) => (
                <div className="setting-label-info">
                    <p>{editValues.firstName + " " + editValues.lastName}</p>
                </div>
            )}
        />
        <EditableForm
            mainLabel="Contact info"
            values={{email: userInfo.email, mobileNumber: userInfo.mobileNumber}}
            editBtn={activeEdit === "contact"}
            setEditBtn={(value) => setActiveEdit(value ? "contact" : null)}
            onSubmit={(values) => updateData("contact", values)}
            fields={[{name: "email", type: "email", required: true, placeholder: "Email"}]}
            loading={loading}
            disableEditBtns={activeEdit !== null}
            extraContent={(editValues, setEditValues) => (
                <>  
                    {userInfo.isEmailVerified ?
                        <p className='email-verified'>Your email is verified.</p>
                        :
                        <div className="email-not-verified">
                            <p>Your email is not yet verified.</p>
                            <button type="button" 
                                    className={verifyEmailBtn === "Email sent" || emailLoading || loading ? "disabled-verify-btn" : ""} 
                                    onClick={handleVerifyEmail} 
                                    disabled={verifyEmailBtn === "Email sent" || emailLoading || loading}>
                                {emailLoading ? <CircularProgress size="10px" style={{marginLeft: "10px"}} /> : verifyEmailBtn}
                            </button>
                        </div>
                    }
                    <PhoneInput
                        country='al'
                        className="phone-input"
                        value={editValues.mobileNumber}
                        disabled={loading}
                        placeholder="+355 6x 12 34 567"
                        onChange={(value) => setEditValues(prev => ({...prev, mobileNumber: value}))} 
                    />
                </> 
            )}
            conditionalExtra={(editValues) => (
                <>  
                    <div className="setting-label-info">
                        <label>Email address{userInfo.isEmailVerified ? <span className='verified'>(Verified)</span> : <span className='not-verified'>(Not verified)</span>}</label>
                        <p>{editValues.email}</p>
                    </div>
                    {editValues.mobileNumber ? <>
                        <hr className="settings-hr"/>
                        <div className="setting-label-info">
                            <label>Phone number</label>
                            <p>{editValues.mobileNumber}</p>
                        </div>
                    </>
                    :
                    <>
                        <hr className="settings-hr"/>
                        <div className="setting-label-info">
                            <label>No number added</label>
                        </div>
                    </>  
                    } 
                </> 
            )}
        />
        <EditableForm 
            mainLabel="Address"
            values={{country: userInfo.country, city: userInfo.city, street: userInfo.street, postalCode: userInfo.postalCode}}
            editBtn={activeEdit === "address"}
            setEditBtn={(value) => setActiveEdit(value ? "address" : null)}
            onSubmit={(values) => updateData("address", values)}
            fields={[
                {name: "country", required: true, placeholder: "State"},
                {name: "city", required: true, placeholder: "City"},
                {name: "street", placeholder: "Street"},
                {name: "postalCode", type: "text", required: true, placeholder: "Postal code"}
            ]}
            disableEditBtns={activeEdit !== null}
            loading={loading}
            conditionalExtra={(editValues) => (
                <div className="setting-label-info">
                    <label>State, city, street, postal code</label>
                    <p>
                        {(() => {
                            const parts = [
                                editValues.country && editValues.country.trim(),
                                editValues.city && editValues.city.trim(),
                                editValues.street && editValues.street.trim(),
                                editValues.postalCode && editValues.postalCode.trim(),
                            ].filter(Boolean);

                            return parts.length > 0 ? parts.join(", ") : "Address not set";
                        })()}
                    </p>
                </div>
            )}
        />
      </>
    )
}

export default PersonalInfo;