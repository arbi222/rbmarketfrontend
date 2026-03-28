import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./order.css";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import defaultProfilePicture from "../../../public/assets/defaultPerson.jpg";
import { useEffect } from "react";
import { updateOrder, getSingleOrder, resetMessages, resetSingleOrder } from "../../redux/features/ordersSlice";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import { capitalizeFirstLetter, timeAgo } from "../../utils/helper";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";
import { openGeneralPopUp, setAmountValue, setFundValue, setOrderId, setPaymentFrom, setPaymentOptionChoosen } from "../../redux/features/uiSlice";

const Order = () => {

    const {orderId} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {order, loading, isFetchingChecked, error, successMessage} = useSelector((state) => state.order);
    const {userInfo} = useSelector((state) => state.user);

    useEffect(() => {
      dispatch(resetSingleOrder());
      dispatch(getSingleOrder({id: orderId}));
    }, [orderId]);

    useEffect(() => {
        if (successMessage) toast.success(successMessage)
        if (error) toast.error(error);
        dispatch(resetMessages());
    }, [error, successMessage])

    const [searchParams, setSearchParams] = useSearchParams();
    const paymentSuccess = searchParams.get("paymentSuccess");
    const paymentSuccessAndoldOrder = searchParams.get("oldOrder");
    const failedStripe = searchParams.get("failed");

    useEffect(() => {
      if (paymentSuccess === "true"){
        toast.success("Payment successful");
        searchParams.delete("paymentSuccess");
        setSearchParams(searchParams);
      }
      if (paymentSuccessAndoldOrder){
        toast.warn("Old order expired. Created new order and finalised it.");
        searchParams.delete("oldOrder");
        setSearchParams(searchParams);
      }
      if (failedStripe){
        searchParams.delete("failed");
        setSearchParams(searchParams);
        window.location.reload();
      }
    }, [paymentSuccess, failedStripe])

    const handleWritingReview = (productSlug) => {
        navigate(`/item/${productSlug}`, {
            state: {
                scrollTo: "reviewForm"
            }
        })
    }

    const handleCancelOrder = (orderId) => {
        if (order.payment.provider === "internal") return;
        if (userInfo._id !== order.buyer?._id) return;
        try{
            dispatch(updateOrder({orderId, status: "cancelled"}));
        }
        catch(err){
            console.error(err)
        }
    };

    const amountToFundValue = {
        500: 1,
        1000: 2,
        2500: 3,
        5000: 4,
        10000: 5,
        25000: 6
    };

    const handleNewOrder = (order) => {
        if (order.payment.provider === "internal") return;
        if (userInfo._id !== order.buyer?._id) return;
        if (order.payment.provider === "stripe"){
            if (order.type === "deposit"){
                dispatch(openGeneralPopUp("payment"));
                dispatch(setPaymentOptionChoosen("stripe"));
                dispatch(setOrderId(order._id));
                const fundValue = amountToFundValue[order.totalAmount];
                dispatch(setFundValue(fundValue));
                dispatch(setPaymentFrom(`/order/${order._id}?`));
            }
            else if (order.type === "withdraw"){
                dispatch(openGeneralPopUp("withdraw"));
                dispatch(setPaymentOptionChoosen("stripe"));
                dispatch(setOrderId(order._id));
                dispatch(setAmountValue(parseFloat((order.totalAmount / 100).toFixed(2))));
            }
        }
        else if (order.payment.provider === "paypal"){
            if (order.type === "deposit"){
                dispatch(openGeneralPopUp("payment"));
                dispatch(setPaymentOptionChoosen("paypal"));
                dispatch(setOrderId(order._id));
                const fundValue = amountToFundValue[order.totalAmount];
                dispatch(setFundValue(fundValue));
            }
            else if (order.type === "withdraw"){
                dispatch(openGeneralPopUp("withdraw"));
                dispatch(setPaymentOptionChoosen("paypal"));
                dispatch(setOrderId(order._id));
                dispatch(setAmountValue(parseFloat((order.totalAmount / 100).toFixed(2))));
            }
        }
    }

    if (loading && !isFetchingChecked){
        return (
            <div className='order-loading-screen'>
                <CircularProgress size={40} thickness={5} />
            </div>
        )
    }

    if (!order){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>There is no order found with the provided ID!</p>
            </div>
        )
    }

    return (
      <div className="order-page">
        <PageTitle title="View Order | RB Market" />
        <PayMethodAction from={"/checkout?"} />
        <Navbar />

        <div className="order-container">
            <h1>
                Ordered by
                {order.buyer ? 
                    <Link to={`/profile/${order.buyer.slug}`}>
                        {order.buyer.firstName + " " + order.buyer.lastName}
                    </Link>
                :
                    " Deleted User"
                }
            </h1>

            <div className="order-details">
                <div className="order-summary">
                    <h2>Order summary</h2>
                    <hr className="order-hr-seperator"/>
                    <div className="order-summary-info">
                        <div className="order-summary-details">
                            <p>Order ID: </p>
                            <span>{order._id}</span>
                        </div>
                        <div className="order-summary-details">
                            <p>Order time: </p>
                            <span>{timeAgo(order.createdAt)}</span>
                        </div>
                        <div className="order-summary-details">
                            <p>Total amount: </p>
                            <span>${(order.totalAmount / 100).toFixed(2)}</span>
                        </div>
                        <div className="order-summary-details">
                            <p>Status: </p>
                            <span>{capitalizeFirstLetter(order.status)}</span>
                        </div>
                        {order.payment.provider !== "internal" &&
                            <>
                                <div className="order-summary-details">
                                    <p>Order type: </p>
                                    <span>{capitalizeFirstLetter(order.type)}</span>
                                </div>
                                <div className="order-summary-details">
                                    <p>Payment method: </p>
                                    <span>{capitalizeFirstLetter(order.payment.provider)}</span>
                                </div>
                            </>
                        }
                    </div>
                    {(order.status === "pending" || order.status === "failed") && (userInfo._id === order.buyer?._id) &&
                        <>
                            <hr className="order-hr-seperator"/>
                            <div className="retry-order-section">
                                <button className="cancel-order" onClick={() => handleCancelOrder(order._id)}>
                                    Cancel order
                                </button>
                                <button className="retry-order" onClick={() => handleNewOrder(order)}>
                                    Retry order
                                </button>
                            </div>
                        </>
                    }
                </div>

                {order.payment.provider === "internal" &&
                    <div className="order-shipping-address">
                        <h2>Shipping address</h2>
                        <hr className="order-hr-seperator"/>
                        <div className="order-shipping-info">
                            <div className="order-shipping-details">
                                <p>Name: </p>
                                <span>{order.shippingAddress.firstName + " " + order.shippingAddress.lastName}</span>
                            </div>
                            <div className="order-shipping-details">
                                <p>Email: </p>
                                <span>{order.shippingAddress.email}</span>
                            </div>
                            <div className="order-shipping-details">
                                <p>Mobile number: </p>
                                <span>{order.shippingAddress.mobileNumber}</span>
                            </div>
                            <div className="order-shipping-details">
                                <p>Address: </p>
                                <span>{order.shippingAddress.country + ", " + order.shippingAddress.city + ", " + 
                                    order.shippingAddress.street + ", " + order.shippingAddress.postalCode}
                                </span>
                            </div>
                        </div>
                    </div>
                }
            </div>
            
            {order.payment.provider === "internal" &&
                <div className="order-products-container">
                    <h2>Order item(s)</h2>
                    <hr className="order-hr-seperator"/>
                    <div className="order-products-info">
                        <div className="order-products">
                            {order.items.map(item => {
                                return (
                                    <div className="order-product" key={item._id}>
                                        <div className="order-product-wrapper">
                                            <Link to={`/item/${item.product?.slug || item.productSlug}`}>
                                                <img src={item.product?.image || defaultProductPicture} alt="Product image" onError={(e) => {e.currentTarget.src = defaultProductPicture}}/>
                                            </Link>
                                            <div className="order-product-title">
                                                <Link to={`/item/${item.product?.slug || item.productSlug}`}>
                                                    <h3>{capitalizeFirstLetter(item.product?.title || item.productTitle)}</h3>
                                                </Link>
                                            </div>
                                            <hr className="order-hr"/>
                                            <div className="order-product-details">
                                                <p>Condition: </p>
                                                <span>{item.product?.condition || item.productCondition}</span>
                                            </div>
                                            <div className="order-product-details">
                                                <p>Unit price: </p>
                                                <span>${(item.unitPrice / 100).toFixed(2)}</span>
                                            </div>
                                            <div className="order-product-details">
                                                <p>Quantity: </p>
                                                <span>{item.quantity}</span>
                                            </div>
                                            <div className="order-product-details">
                                                <p>Subtotal: </p>
                                                <span>${(item.subtotal / 100).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <hr className="order-hr"/>
                                        {item.seller ?
                                            <div className="order-product-seller">
                                                <p>Sold by: </p>
                                                <div className="order-seller-details">
                                                    <Link to={`/profile/${item.seller.slug}`}>
                                                        <img src={item.seller.avatar || defaultProfilePicture} 
                                                            alt="Profile image" 
                                                            onError={(e) => {e.currentTarget.src = defaultProfilePicture}}/>
                                                    </Link>
                                                    <Link to={`/profile/${item.seller.slug}`}>
                                                        <h4>{item.seller.firstName + " " + item.seller.lastName}</h4>
                                                    </Link>
                                                </div>
                                            </div>
                                            :
                                            <div className="order-product-seller">
                                                <p>Sold by: </p>
                                                <div className="order-seller-details">
                                                    <img src={defaultProfilePicture} 
                                                        alt="Profile image" 
                                                        onError={(e) => {e.currentTarget.src = defaultProfilePicture}}/>
                                                    <h4>Deleted User</h4>
                                                </div>
                                            </div>
                                        }
                                        {(order.status === "delivered" && order.buyer?._id === userInfo._id) &&
                                            <>
                                                {item.seller && 
                                                    <> 
                                                        <hr className="order-hr"/>
                                                        <div className="order-leave-review">
                                                            <button className="btn" onClick={() => handleWritingReview(item.product.slug)}>
                                                                Leave a review
                                                            </button>
                                                        </div> 
                                                    </> 
                                                }
                                            </>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }
        </div>

        {!loading &&
            <Footer />
        }
      </div>
    )
}

export default Order;