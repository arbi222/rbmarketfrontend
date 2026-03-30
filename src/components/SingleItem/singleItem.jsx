import "./singleItem.css";
import paypalIcon from "../../../public/assets/paypal.png"
import visaIcon from "../../../public/assets/visa.png"
import masterCardIcon from "../../../public/assets/money.png"
import stripeIcon from "../../../public/assets/stripe.png"
import { toast } from "react-toastify";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import defaultProfilePicture from "../../../public/assets/defaultPerson.jpg";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import { openGeneralPopUp, closeGeneralPopUp, setinsufficientValue, clearInsufficientValue } from "../../redux/features/uiSlice";
import { useNavigate } from "react-router-dom";
import { addToCartCall, resetMessages, addToCart } from "../../redux/features/cartSlice";
import ProtectedLink from "../ProtectedLink/protectedLink";

const SingleItem = ({onReadMore}) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const generalPopUp = useSelector((state) => state.ui.generalPopUp);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const { userInfo } = useSelector((state) => state.user);
    const { product } = useSelector((state) => state.product.singleProduct);
    const { loading, error } = useSelector((state) => state.cart);
      
    const [popUpUsage, setPopUpUsage] = useState("");

    const [quantityValue, setQuantityValue] = useState(product.stock > 0 ? 1 : 0);

    useEffect(() => {
        if (error) toast.error(error);
        dispatch(resetMessages());
    }, [error])

    const addToCartHandle = async () => {
        if (Number(quantityValue) === 0){
            toast.warn("Quantity must be greater than 1!");
            return;
        };
        if (Number(quantityValue) > product.stock){
            toast.warn("Quantity must be lower or equal to the items available!");
            return;
        }

        if (isAuthenticated){
            try{
                await dispatch(addToCartCall({productId: product._id, quantity: Number(quantityValue)})).unwrap();
                setPopUpUsage("adding-to-cart");
                dispatch(openGeneralPopUp("add-to-cart"));
            }
            catch(err){
                console.error(err);
            }       
        }
        else{
            dispatch(addToCart({productId: product._id, quantity: Number(quantityValue), stock: product.stock}));
            setPopUpUsage("adding-to-cart");
            dispatch(openGeneralPopUp("add-to-cart"));
        }
    }

    const buyItNow = async () => {
        if (Number(quantityValue) === 0){
            toast.warn("Quantity must be greater than 1!");
            return;
        };
        if (Number(quantityValue) > product.stock){
            toast.warn("Quantity must be lower or equal to the items available!");
            return;
        }
        if (isAuthenticated) {
            const valueToPay = parseFloat((product.price * Number(quantityValue)).toFixed(2));
            if (userInfo.walletBalance >= valueToPay){
                navigate(`/checkout?itemSlug=${product.slug}&quantity=${Number(quantityValue)}`);
            }
            else{
                const insufficientValue = parseFloat((valueToPay - userInfo.walletBalance).toFixed(2));
                dispatch(clearInsufficientValue());
                dispatch(openGeneralPopUp("add-funds"));
                dispatch(setinsufficientValue(insufficientValue));
            }
        }
        else{
            setPopUpUsage("buy-item");
            if (product.stock > 0){ 
                dispatch(openGeneralPopUp("add-to-cart"));
            }
            else{
                setPopUpUsage("");
                toast.info("This item has been sold!");
            }
        } 
    }

    const sendToCart = () => {
        dispatch(closeGeneralPopUp()); 
        setPopUpUsage("");
        navigate("/cart");
    }

    const signIn = () => {
        dispatch(closeGeneralPopUp());
        setPopUpUsage("");
        navigate("/sign-in", {
            state: {
                from: `/checkout?itemSlug=${product.slug}&quantity=${quantityValue}`
            }
        })
    }

    const checkoutPage = () => {
        const valueToPay = product.price * quantityValue;
        if (userInfo.walletBalance >= valueToPay){
            dispatch(closeGeneralPopUp()); 
            setPopUpUsage("");
            navigate(`/checkout?itemSlug=${product.slug}&quantity=${quantityValue}`);
        }
        else{
            dispatch(openGeneralPopUp("add-funds"));
        }
    }

    const totalReviews = product.seller.feedbackPositive + product.seller.feedbackNegative;
    let reviewPositivePercentage = 0;
    if (totalReviews > 0){
        reviewPositivePercentage = ((product.seller.feedbackPositive / totalReviews) * 100).toFixed(2);
    }

    return (
        <div className="item-container">
            <div className="item-img">
                <img src={product.image || defaultProductPicture} alt="Item-image" onError={(e) => {e.currentTarget.src = defaultProductPicture}}/>
            </div>
            <div className="item-info">
                <h1 className="item-name">{product.title}</h1>

                <hr className="item-hr"/>

                <div className="item-seller">
                    <ProtectedLink to={`/profile/${product.seller.slug}`} 
                                children={
                                    <img src={product.seller.avatar || defaultProfilePicture} alt="seller-image" onError={(e) => {e.currentTarget.src = defaultProfilePicture}}/>
                                } 
                                state={{from: `/profile/${product.seller.slug}`}}
                    />
                    <div className="seller-info">
                        <ProtectedLink to={`/profile/${product.seller.slug}`} 
                                    children={product.seller.firstName + " " + product.seller.lastName} 
                                    state={{from: `/profile/${product.seller.slug}`}}
                        />
                        <span> ({totalReviews})</span>
                        <p>{reviewPositivePercentage}% positive</p>
                    </div>
                </div>

                <hr className="item-hr"/>

                <h2 className="item-price">${(product.price / 100).toFixed(2)}</h2>

                <hr className="item-hr"/>

                <div className="condition-specifics">
                    <div className="conditions">
                        <p>Condition:</p>
                        <span>{product.condition}</span>
                    </div>
                    {(userInfo._id === product.seller._id || userInfo.isAdmin) &&
                        <div className="specifics">
                            <p>Stock:</p>
                            <span>{product.stock} items available</span>
                        </div>
                    }
                    <div className="specifics">
                        <p>Item specifics:</p>
                        <button onClick={onReadMore}>Read below</button>
                    </div>
                </div>

                {(userInfo._id !== product.seller._id && !userInfo.isAdmin) &&
                    <>
                        <div className="quantity">
                            <p>Quantity: </p>
                            <input type="number" 
                                    min={1} 
                                    max={product.stock} 
                                    value={quantityValue} 
                                    disabled={product.stock < 1}
                                    onChange={(e) => setQuantityValue(e.target.value)}
                            />
                            <span>{product.stock} {product.stock > 1 ? "items" : "item"} available</span>
                        </div>


                        <div className="settings-btns command-btns">
                            <button className={`save-settings command-btn ${product.stock < 1 ? "disabled-btn disabled-buy-btn" : ""}`} onClick={buyItNow} disabled={product.stock < 1}>
                                Buy it now
                            </button>
                            <button className={`cancel-settings command-btn ${product.stock < 1 ? "disabled-btn disabled-buy-btn" : ""}`} onClick={addToCartHandle} disabled={product.stock < 1}>
                                Add to cart
                            </button>
                        </div>

                        <div className="shipping">
                            <p>Delivery:</p>
                            <span>Estimated 24 hours from now to your address.</span>
                        </div>

                        <div className="payments">
                            <p>Payments:</p>
                            <img src={paypalIcon} alt="Paypal" className="payment-images" title="Paypal"/>
                            <img src={stripeIcon} alt="Stripe" className="payment-images" title="Stripe"/>
                            <img src={visaIcon} alt="Visa" className="payment-images" title="Visa"/>
                            <img src={masterCardIcon} alt="Master Card" className="payment-images" title="Master Card"/>
                        </div>
                    </>
                }
            </div>

            {generalPopUp === "add-to-cart" && 
                <GeneralPopUp usage={popUpUsage === "adding-to-cart" ? "adding-to-cart" : "buy-item"} 
                            closePopUp={() => {dispatch(closeGeneralPopUp()); setPopUpUsage("")}}
                            saveBtnText={popUpUsage === "adding-to-cart" ? "View cart" : "Sign in to checkout"}
                            cancelBtnText={popUpUsage === "adding-to-cart" && "Checkout item"}
                            showCancelBtn={(!isAuthenticated && popUpUsage === "buy-item") ? false : true}
                            loading={loading}
                            onCancel={isAuthenticated ? checkoutPage : signIn}
                            onSave={popUpUsage === "adding-to-cart" ? sendToCart : signIn}
                            content={() => {
                                return (
                                    <div className="added-to-cart-item">
                                        <div className="item-info-toCart" style={{margin: popUpUsage === "buy-item" ? "20px auto 20px" : "0"}}>
                                            <img src={product.image || defaultProductPicture} alt="item image" onError={(e) => {e.currentTarget.src = defaultProductPicture}}/>
                                            <h2>{product.title}</h2>
                                        </div>
                                        {popUpUsage === "adding-to-cart" &&
                                            <p className="item-price-toCart">
                                                <span>Price</span>
                                                <span>$ {(product.price / 100).toFixed(2)}</span>
                                            </p>
                                        }
                                    </div>
                                )
                            }}
                />
            }
        </div>
    )
}

export default SingleItem;