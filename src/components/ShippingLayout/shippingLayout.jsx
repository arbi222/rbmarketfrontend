import { useEffect, useState } from "react";
import InputAuthField from "../InputAuthField/inputAuthField";
import "./shippingLayout.css";
import PhoneInput from 'react-phone-input-2';
import { useSelector } from "react-redux";

const ShippingLayout = ({enterShippingInfo, setEnterShippingInfo, shippingInfo, setShippingInfo, isChecked, handleChecking}) => {

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const { userInfo } = useSelector((state) => state.user);

    const pickShippingFields = (userInfo) => ({
        firstName: userInfo?.firstName || "",
        lastName: userInfo?.lastName || "",
        city: userInfo?.city || "",
        country: userInfo?.country || "",
        postalCode: userInfo?.postalCode || "",
        email: userInfo?.email || "",
        street: userInfo?.street || "",
        mobileNumber: userInfo?.mobileNumber || "",
    });

    useEffect(() => {
        if (isAuthenticated && userInfo){
            setShippingInfo(pickShippingFields(userInfo));
        }
    }, [isAuthenticated, userInfo])

    const [missingField, setMissingField] = useState(false);
    const handleShippingInfo = () => {
        const allFilled = Object.values(shippingInfo).every(value => value.trim() !== "");
        if (allFilled){
            setEnterShippingInfo(false);
            setMissingField(false)
        }
        else{
            setMissingField(true)
        }
    }

    return (
      <div className="shipping-layout">
        <div className="top-shipping-layer">
            <h2>Ship to</h2>
            <div className="updating-shipping-info">
                <label htmlFor="toggleSwitch" title="This includes only the shipping info like country, city, street and zip code">Update your account’s shipping information?</label>
                <div className="switch">
                  <input type="checkbox" checked={isChecked} onChange={handleChecking} id="toggleSwitch" />
                  <label htmlFor="toggleSwitch"></label>
                </div>
            </div>
        </div>
        
        <div className="shipping-fields">
            {enterShippingInfo ?
                <>
                    <div className="flex-shipping-layout">
                        <InputAuthField 
                            id="First Name"
                            className="input-style"
                            label="First name"
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo(prev => ({...prev, firstName: e.target.value}))}
                            required={true}
                        />

                        <InputAuthField 
                            id="Last Name"
                            className="input-style"
                            label="Last name"
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo(prev => ({...prev, lastName: e.target.value}))}
                            required={true}
                        />
                    </div>

                    <div className="flex-shipping-layout"> 
                        <InputAuthField 
                            id="City"
                            className={`input-style ${isChecked ? "updateField" : ""}`}
                            label="City"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo(prev => ({...prev, city: e.target.value}))}
                            required={true}
                        />

                        <InputAuthField 
                            id="Country"
                            className={`input-style ${isChecked ? "updateField" : ""}`}
                            label="Country"
                            value={shippingInfo.country}
                            onChange={(e) => setShippingInfo(prev => ({...prev, country: e.target.value}))}
                            required={true}
                        />

                        <InputAuthField 
                            id="Zip code"
                            className={`input-style ${isChecked ? "updateField" : ""}`}
                            label="ZIP code"
                            value={shippingInfo.postalCode}
                            onChange={(e) => setShippingInfo(prev => ({...prev, postalCode: e.target.value}))}
                            required={true}
                        />
                    </div>
                    <div className="flex-shipping-layout">
                        <InputAuthField 
                            id="email"
                            className="input-style"
                            label="Email"
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo(prev => ({...prev, email: e.target.value}))}
                            required={true}
                        />

                        <InputAuthField 
                            id="Street"
                            className={`input-style ${isChecked ? "updateField" : ""}`}
                            label="Street address"
                            value={shippingInfo.street}
                            onChange={(e) => setShippingInfo(prev => ({...prev, street: e.target.value}))}
                            required={true}
                        />
                    </div>

                    <PhoneInput
                        country='al'
                        className="phone-input-shipping"
                        value={shippingInfo.mobileNumber}
                        placeholder="Mobile number"
                        onChange={(value) => setShippingInfo(prev => ({...prev, mobileNumber: value}))} 
                    />
                    {missingField && <p className="missing-field-error">Make sure you fill all the required fields and then click done.</p>}
                    <button className="done-shipping-btn" onClick={handleShippingInfo}>
                        Done
                    </button>
                </>
                :
                    <div className="shipping-info-entered">
                        <p>{`${shippingInfo.firstName} ${shippingInfo.lastName}`}</p>
                        <p>{shippingInfo.street}</p>
                        <p>{`${shippingInfo.city}, ${shippingInfo.country} ${shippingInfo.postalCode}`}</p>
                        <p>{shippingInfo.email}</p>
                        <p>{shippingInfo.mobileNumber}</p>
                        <button className="change-shippingInfo-btn" onClick={() => setEnterShippingInfo(true)}>
                            Change
                        </button>
                    </div>
                }
        </div>
      </div>
    )
}

export default ShippingLayout;