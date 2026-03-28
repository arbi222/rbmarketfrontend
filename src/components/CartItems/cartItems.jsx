import "./cartItems.css";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeFromCart, removeFromCartCall, updateQuantity, updateQuantityCall } from "../../redux/features/cartSlice";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import defaultProfilePic from "../../../public/assets/defaultPerson.jpg";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { clearInsufficientValue, openGeneralPopUp, setinsufficientValue } from "../../redux/features/uiSlice";

const CartItems = ({usage, items, loading, setOverQuantity}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const { userInfo } = useSelector((state) => state.user);
    const isCart = usage === "cart";
    const isCheckout = usage === "checkout";

    const debounceRefs = useRef({});

    const [quantities, setQuantities] = useState({});
    useEffect(() => {
        setQuantities(() => {
            const initial = {};
            items.forEach(item => {
                initial[item.product?._id] = item.quantity;
            });
            return initial;
        })
    }, [items])

    useEffect(() => {
        const hasOverQuantity = items.some(item => item.product?.stock < quantities[item.product?._id]);
        setOverQuantity(hasOverQuantity);
    }, [items])

    const handleQuantityChange = (productId, value, stock) => {
        const qty = Math.max(1, Math.min(stock, Number(value)));

        setQuantities(prev => ({
            ...prev,
            [productId]: qty
        }));

        if (isAuthenticated){
            if (debounceRefs.current[productId]) {
            clearTimeout(debounceRefs.current[productId]);
            }

            debounceRefs.current[productId] = setTimeout(async () => {
                try {
                    await dispatch(updateQuantityCall({productId, quantity: qty})).unwrap();
                } 
                catch (err) {
                    console.error(err);
                }
            }, 500);
        }
        else{
            dispatch(updateQuantity({productId, quantity: qty, stock}));
        }
    }

    const formatPrice = (itemPrice, itemQuantity) => {
        const price = (itemPrice / 100).toFixed(2) * itemQuantity;
        const fixedPrice = Number(price.toFixed(2));
        const formatedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(fixedPrice);
        return formatedPrice;
    }
    
    const removeItem = async (itemId) => {
        if (isAuthenticated){
            try{
                const res = await dispatch(removeFromCartCall(itemId)).unwrap();
                toast.success(res.message);
            }
            catch(err){
                console.error(err);
            }
        }
        else{
            dispatch(removeFromCart(itemId));
            toast.success("Item removed from cart.")
        }
    }

    const buyOneItem = async (itemSlug, quantity, price, stock) => {
        if (isAuthenticated){
            if (quantity > stock){
                toast.warn("Update the quantity of the item you are trying to buy.");
                return;
            }
            const valueToPay = price * quantity;
            if (userInfo.walletBalance >= valueToPay){
                navigate(`/checkout?itemSlug=${itemSlug}&quantity=${quantity}&cart=true`);
            }
            else{
                const insufficientValue = parseFloat((valueToPay - userInfo.walletBalance).toFixed(2));
                dispatch(clearInsufficientValue());
                dispatch(openGeneralPopUp("add-funds"));
                dispatch(setinsufficientValue(insufficientValue));
            }
        }
        else{
            navigate("/sign-in", {
                state: {
                    from: `/checkout?itemSlug=${itemSlug}&quantity=${quantity}`
                }
            })
        }
    }

    return (
        <>
            {items.map((item) => {
                if (!item.product) return;

                const totalReviews = item.product.seller.feedbackPositive + item.product.seller.feedbackNegative;
                let reviewPositivePercentage = 0;
                if (totalReviews > 0){
                    reviewPositivePercentage = ((item.product.seller.feedbackPositive / totalReviews) * 100).toFixed(2);
                }

                const quantity = quantities[item.product._id];

                return (
                    <div className="cart-item-list" key={item.product._id}>
                        <div className="cart-item-seller">
                            <Link to={`/profile/${item.product.seller.slug}`}>
                                <img src={item.product.seller.avatar || defaultProfilePic} alt="seller image" onError={(e) => {e.currentTarget.src = defaultProfilePic}} />
                            </Link>
                            <div className="cart-item-seller-feedback">
                                <div>
                                    <Link to={`/profile/${item.product.seller.slug}`}>{item.product.seller.firstName + " " + item.product.seller.lastName}</Link>
                                    <span>({totalReviews})</span>
                                </div>
                                <p>{reviewPositivePercentage}% positive</p>
                            </div>
                        </div>
                    
                        <div className="cart-item-inside">
                            <div className="cart-item-flex">
                                <Link to={`/item/${item.product.slug}`}>
                                    <img src={item.product.image || defaultProductPicture} 
                                        alt="item image" 
                                        onError={(e) => {e.currentTarget.src = defaultProductPicture}}
                                    />
                                </Link>
                                <Link to={`/item/${item.product.slug}`}><h2>{item.product.title}</h2></Link>
                            </div>
                            <div className="cart-item-stock-qty">
                                {!isCheckout &&
                                    (item.product.stock > 0 ?
                                        <span>{item.product.stock} items available</span>
                                        :
                                        <span>Out of stock</span>
                                    )
                                }
                                <div className="cart-item-flex cart-item-qty">
                                    {isCart ? 
                                        (item.product.stock > 0 && 
                                            <>
                                                <p>Qty: </p>
                                                <input type="number"
                                                        className={`${item.product.stock < quantity ? "over-quantity" : ""}`} 
                                                        min="1" 
                                                        max={item.product.stock} 
                                                        disabled={loading} 
                                                        value={quantity} 
                                                        onChange={(e) => handleQuantityChange(item.product._id, e.target.value, item.product.stock)}
                                                /> 
                                            </>
                                        )
                                        :
                                        <>
                                         <p className={`${item.product.stock < quantity ? "over-quantity-p" : ""}`}>Qty: </p>   
                                         <p className={`${item.product.stock < quantity ? "over-quantity-p" : ""}`}>{quantity}</p>
                                        </>
                                    }
                                </div>
                            </div>
                            <h2>{formatPrice(item.product.stock > 0 ? item.product.price : 0, quantity)}</h2>
                        </div>

                        {isCart &&
                            <div className="cart-item-btns">
                                <button className={`buy-item-btn ${loading || item.product.stock < 1 ? "disabled-btn disabled-buyItem-btn" : ""}`} 
                                        disabled={loading || item.product.stock < 1} 
                                        onClick={() => buyOneItem(item.product.slug, quantity, item.product.price, item.product.stock)}
                                >
                                    Buy it now
                                </button>
                                <button className={loading ? "disabled-btn" : ""} 
                                        disabled={loading} 
                                        onClick={() => removeItem(item.product._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        }
                    </div>
                )
            })}
        </>
    )
}

export default CartItems;