import { useDispatch, useSelector } from "react-redux";
import "./addingFunds.css";
import { openGeneralPopUp, setFundValue, setPaymentFrom } from "../../redux/features/uiSlice";

const AddingFunds = ({popUp, from}) => {

    const fundList = [
        {_id: 1, value: 5},
        {_id: 2, value: 10},
        {_id: 3, value: 25},
        {_id: 4, value: 50},
        {_id: 5, value: 100},
        {_id: 6, value: 250},
    ]

    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.user);
    const {insufficientValue} = useSelector((state) => state.ui);

    const handleClicking = (optionId) => {
        dispatch(openGeneralPopUp("payment"));
        dispatch(setFundValue(optionId));
        dispatch(setPaymentFrom(from));
    }

    return (
        <div>
            <h2 className={`funds-header ${popUp ? "funds-header-popup" : ""}`}>
                {userInfo.isAdmin ? "Revenue:" : "Balance:"} <span>{(userInfo.walletBalance / 100).toFixed(2)}$</span>
            </h2>
            {!userInfo.isAdmin &&
                <>
                    {popUp && <p className="not-enough-funds">Insufficient funds. You need ${(insufficientValue / 100).toFixed(2)} more.</p>}
                    <div className="adding-funds-container">
                        {fundList.map(option => (
                            <div className="fund-item" key={option._id}>
                                <div>
                                    <h3>Add {option.value}$</h3>
                                    {option._id === 1 && <p>Minimum fund level</p>}
                                </div>
                                <button className="btn" onClick={() => handleClicking(option._id)}>
                                    Add funds
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    )
}

export default AddingFunds;