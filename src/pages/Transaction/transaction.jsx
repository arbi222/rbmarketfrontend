import { Link, useParams } from "react-router-dom";
import "./transaction.css";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import { capitalizeFirstLetter, timeAgo } from "../../utils/helper";
import PageTitle from "../../components/PageTitle/pageTitle";
import { getSingleTransaction, resetSingleTransaction, resetTransactionMessages } from "../../redux/features/adminSlice";

const Transaction = () => {

    const {transactionId} = useParams();
    const dispatch = useDispatch();
    const {singleTransaction, loading, isFetchingChecked, error, successMessage} = useSelector((state) => state.admin.transactions);
    const {userInfo} = useSelector((state) => state.user);

    useEffect(() => {
        if (userInfo.isAdmin){
            dispatch(resetSingleTransaction());
            dispatch(getSingleTransaction({transactionId}));
        }
    }, [transactionId, userInfo]);

    useEffect(() => {
        if (successMessage) toast.success(successMessage)
        if (error) toast.error(error);
        dispatch(resetTransactionMessages());
    }, [error, successMessage])

    if (!userInfo.isAdmin){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>You are not allowed to access this page!</p>
            </div>
        )
    }

    if (loading && !isFetchingChecked){
        return (
            <div className='transaction-loading-screen'>
                <CircularProgress size={40} thickness={5} />
            </div>
        )
    }

    if (!singleTransaction){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>There is no transaction found with the provided ID!</p>
            </div>
        )
    }

    return (
      <div className="transaction-page">
        <PageTitle title="View Transaction | RB Market" />
        <Navbar />

        <div className="transaction-container">
            <h1>
                Transaction of
                {singleTransaction.user ? 
                    <Link to={`/profile/${singleTransaction.user.slug}`}>
                        {singleTransaction.user.firstName + " " + singleTransaction.user.lastName}
                    </Link>
                :
                    " Deleted User"
                }
            </h1>

            <div className="transaction-details">
                <div className="transaction-summary">
                    <h2>Transaction summary</h2>
                    <hr className="transaction-hr-seperator"/>
                    <div className="transaction-summary-info">
                        <div className="transaction-summary-details">
                            <p>Transaction ID: </p>
                            <span>{singleTransaction._id}</span>
                        </div>
                        <div className="transaction-summary-details">
                            <p>Transaction time: </p>
                            <span>{timeAgo(singleTransaction.createdAt)}</span>
                        </div>
                        <div className="transaction-summary-details">
                            <p>Amount: </p>
                            <span>${(singleTransaction.amount / 100).toFixed(2)}</span>
                        </div>
                        <div className="transaction-summary-details">
                            <p>Balance After: </p>
                            <span>${(singleTransaction.balanceAfter / 100).toFixed(2)}</span>
                        </div>
                        <div className="transaction-summary-details">
                            <p>Type: </p>
                            <span>{capitalizeFirstLetter(singleTransaction.type)}</span>
                        </div>
                        <div className="transaction-summary-details">
                            <p>Provider: </p>
                            <span>{capitalizeFirstLetter(singleTransaction.provider)}</span>
                        </div>
                        {singleTransaction.relatedOrder &&
                            <div className="transaction-summary-details">
                                <p>Related order: </p>
                                <span>
                                    <Link to={`/order/${singleTransaction.relatedOrder}`}>
                                        {singleTransaction.relatedOrder}
                                    </Link>
                                </span>
                            </div>
                        }
                    </div>
                </div>

                {singleTransaction.relatedProduct &&
                    <div className="transaction-product-container">
                        <h2>Related product</h2>
                        <hr className="transaction-hr-seperator"/>
                        <div className="transaction-product">
                            <div className="transaction-product-wrapper">
                                <Link to={`/item/${singleTransaction.relatedProduct.slug}`}>
                                    <img src={singleTransaction.relatedProduct.image || defaultProductPicture} 
                                        alt="Product image" 
                                        onError={(e) => {e.currentTarget.src = defaultProductPicture}}
                                    />
                                </Link>
                                <div className="transaction-product-title">
                                    <Link to={`/item/${singleTransaction.relatedProduct.slug}`}>
                                        <h3>{capitalizeFirstLetter(singleTransaction.relatedProduct.title)}</h3>
                                    </Link>
                                </div>
                                <hr className="transaction-hr"/>
                                <div className="transaction-product-details">
                                    <p>Product price: </p>
                                    <span>${(singleTransaction.relatedProduct.price / 100).toFixed(2)}</span>
                                </div>
                            </div>   
                        </div>
                        
                    </div>
                }
            </div>
        </div>

        {!loading &&
            <Footer />
        }
      </div>
    )
}

export default Transaction;