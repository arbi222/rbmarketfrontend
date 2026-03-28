import "./generalPopUp.css";
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import { CircularProgress } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';

const GeneralPopUp = ({usage, closePopUp, content, onCancel, onSave, cancelBtnText = "Cancel", 
                    saveBtnText = "Save", disabledSaveBtn, showLastBtns = true, showCancelBtn = true, 
                    loading, paymentOption, amount, setAmount, showAmount, amountDisabled, receiverEmail, setReceiverEmail}) => {

    const isPayment = usage === "payment";
    const isWithdraw = usage === "withdraw";
    const isAddToCart = usage === "adding-to-cart";
    const isBuyItem = usage === "buy-item";
    const isSearchBar = usage === "searchBar";
    const isNotifications = usage === "notifications";
    const isCart = usage === "cart";
    const isTFA = usage === "TFA";
    const isAskingYesNo = usage === "YesNo";
    const isEmailVerify = usage === "emailVerify";
    const isEmailVerifyLinkSent = usage === "emailVerifyLinkSent";
    const isSetPassword = usage === "setPassword";
    const isSetStatus = usage === "setStatus";
    const isAccountDeletion = usage === "DeleteAccountLoading";
    const isAddingFunds = usage === "add-funds";
    const isBannedAccount = usage === "BannedAccount";

    if ((isAddToCart || isBuyItem || isAccountDeletion) && loading){
        return (
            <div className="popup-backdrop">
                <div className={`general-popup ${usage}`}>
                    <div className="loading-addingToCart">
                        <CircularProgress size="30px" className="save-btn-loader"/>
                        <h3>
                            {isAddToCart ? "Adding to your cart..." : 
                            isBuyItem ? "Loading item..." :
                            isAccountDeletion && "Loading account delete..."}
                        </h3>
                    </div>
                </div>
            </div>
        )
    }

    const isStripeInvalid = paymentOption === "stripe" && showAmount && Number(amount) <= 0;
    const isPaypalInvalid = paymentOption === "paypal" && (Number(amount) <= 0 || receiverEmail === "");
    const buttonDisabled = loading || disabledSaveBtn || paymentOption === null || isStripeInvalid || isPaypalInvalid;

    return (
        <div className="popup-backdrop">
            <div className={`general-popup ${usage}`}>

                {!isTFA && !isEmailVerify && !isSetPassword && !isSetStatus &&
                    <button className={`btn close-popup-btn ${loading ? "disabled-btn" : ""}`} 
                                    onClick={closePopUp} 
                                    disabled={loading}
                    >
                        <CloseIcon />
                    </button>
                }

                <h3 className={`popup-header ${usage}-header`}>
                    {isPayment && "Choose Payment Method"}
                    {isWithdraw && "Choose Withdrawal Method"}
                    {isAddToCart && 
                        <span>
                            <DoneIcon className="done-icon" style={{fontSize: "30px"}}/>
                            Added to cart
                        </span>
                    }
                    {isBuyItem && 
                        <span>
                            Buy item
                        </span>
                    }
                    {isSearchBar && "Search"}
                    {isTFA && "Two Factor Authentication"}
                    {isEmailVerify && "Email verification required"}
                    {isEmailVerifyLinkSent && "Email verification"}
                    {isSetPassword && "Reset password"}
                    {isSetStatus && "Set account status"}
                    {isBannedAccount && "Account has been banned"}
                </h3>
                
                {isPayment &&
                    <p className={`popup-p-${usage}`}>
                        Click an option below to continue the process
                    </p>
                }

                <div className={`pop-up-content ${usage}-content`}>
                    {content()}
                </div>

                {isWithdraw &&
                    <div className="withdraw-amount-section">
                        {(paymentOption === "paypal" || showAmount) &&
                            <div className="withdraw-amount-input">
                                <label htmlFor="amount">Amount to withdraw in $:</label>
                                <input type="number" id="amount" min={"0"} value={amount} disabled={amountDisabled} onChange={(e) => setAmount(e.target.value)}/>
                            </div>
                        }
                        {paymentOption === "paypal" &&
                            <div className="withdraw-email">
                                <label htmlFor="email">Receiver Email:</label>
                                <input type="email" id="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)}/>
                            </div>
                        }
                    </div>
                }
                
                {showLastBtns &&
                    <div className={`${usage}-bottom-part`}>
                        {(isPayment || isWithdraw) &&
                            <p className="payment-secure-p">
                                <span>
                                    <LockIcon fontSize="small"/>
                                </span>
                                Secure and private
                            </p>
                        }
                        <div className={`settings-btns pop-up-btns ${usage}-btns`}>
                            {showCancelBtn &&
                                <button className={`btn cancel-settings ${loading ? "disabled-btn" : ""}`} 
                                        disabled={loading}
                                        onClick={(isPayment || isWithdraw) ? closePopUp : onCancel}>
                                    {cancelBtnText}
                                </button>
                            }
                            <button className={`btn save-settings ${buttonDisabled ? "disabled-btn" : ""}`} 
                                    onClick={onSave}
                                    disabled={buttonDisabled}>
                                {loading ? <CircularProgress size="20px" className="save-btn-loader"/> : saveBtnText}
                            </button>
                        </div>
                    </div>
                }
            </div>    
        </div>
    )
}

export default GeneralPopUp;