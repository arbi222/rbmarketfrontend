import "./orderDetails.css";

const OrderDetails = ({type, itemsLength, formatedPrice, loading, disabled, onSubmit}) => {

    const isCheckout = type === "checkout";
    const isCart = type === "cart";

    return (
        <div className="cart-item-right">
            {isCheckout && 
                <h2>Order Summary</h2>
            }
            <div className="cart-item-right-flex">
                <p>Items ({itemsLength})</p>
                <p>{formatedPrice}</p>
            </div>
            <div className="cart-item-right-flex">
                <p>Shipping</p>
                <p>FREE</p>
            </div>
            <div className="cart-item-right-flex">
                <p>Delivery</p>
                <p>24 hours</p>
            </div>
            <hr className="cart-item-hr"/>
            <div className="cart-item-right-flex">
                <h3>Subtotal</h3>
                <h3>{formatedPrice}</h3>
            </div>
            <button className={loading || disabled ? "disabled-btn" : ""} disabled={loading || disabled} onClick={onSubmit}> 
                {isCart ? "Checkout" : "Confirm and pay"}
            </button>    
        </div>
    )
}

export default OrderDetails;