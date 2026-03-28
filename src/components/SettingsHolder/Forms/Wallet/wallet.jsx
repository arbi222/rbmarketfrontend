import "./wallet.css";
import { useDispatch, useSelector } from 'react-redux';
import { openGeneralPopUp } from "../../../../redux/features/uiSlice";
import AddingFunds from "../../../AddingFunds/addingFunds";
import { toast } from "react-toastify";

const Wallet = () => {
    const dispatch = useDispatch();
    const {userInfo} = useSelector((state) => state.user);

    const handleWithdraw = () => {
        if (userInfo.walletBalance > 0){
            dispatch(openGeneralPopUp("withdraw"))
        }
        else{
            toast.warn("Your balance is $0");
        }
    }

    return (
        <div className="payment-container">
            <AddingFunds from="/settings?section=payment&"/>

            <div className="withdrawal-container">
                <hr className="settings-hr"/>
                <h2 className="payment-header">Withdraw your balance</h2>
                <div className="withdrawal-item">
                    <div>
                        <h3>Request a payout</h3>
                    </div>
                    <button className="btn withdraw-btn" onClick={handleWithdraw}>
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Wallet;