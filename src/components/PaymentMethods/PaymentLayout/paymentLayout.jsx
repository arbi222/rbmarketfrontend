import "./paymentLayout.css";
import stripeImg from "../../../../public/assets/stripe.png"
import payPalImg from "../../../../public/assets/paypal.jpg"

const PaymentLayout = ({paymentOption, setPaymentOption, stripeDisabled, paypalDisabled}) => {
    return (
        <div className="payment-method">
            <label htmlFor="stripe" className={stripeDisabled ? "disabled-state" : ""}>
                <input type="radio" 
                    name="payment"
                    value="stripe" 
                    id="stripe"
                    disabled={stripeDisabled}
                    checked={paymentOption === "stripe"}
                    onChange={(e) => setPaymentOption(e.target.value)}
                />
                <span>
                    <img src={stripeImg} alt="Stripe option"/>
                </span>
                Stripe
            </label>
            <label htmlFor="paypal" className={paypalDisabled ? "disabled-state" : ""}>
                <input type="radio" 
                    name="payment"
                    value="paypal" 
                    id="paypal"
                    disabled={paypalDisabled}
                    checked={paymentOption === "paypal"}
                    onChange={(e) => setPaymentOption(e.target.value)}
                    />
                <span>
                    <img src={payPalImg} alt="paypal option" />
                </span>
                PayPal
            </label>
        </div>
    )
}

export default PaymentLayout;