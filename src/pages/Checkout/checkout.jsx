import { useEffect, useState } from "react";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import "./checkout.css";
import InfoIcon from '@mui/icons-material/Info';
import CartItems from "../../components/CartItems/cartItems";
import Footer from "../../components/Footer/footer";
import { useSearchParams } from "react-router-dom";
import ShippingLayout from "../../components/ShippingLayout/shippingLayout";
import OrderDetails from "../../components/OrderDetails/orderDetails";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import { clearInsufficientValue, openGeneralPopUp, setinsufficientValue } from "../../redux/features/uiSlice";
import { getSingleProduct } from "../../redux/features/productSlice";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import axiosInstance from "../../redux/api/axios";
import { updateAccount } from "../../redux/features/userSlice";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Checkout = () => {

    const dispatch = useDispatch();
    const { items: cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.user);

    const [checkoutItems, setCheckoutItems] = useState([]);

    const [searchParams] = useSearchParams();
    const itemSlug = searchParams.get("itemSlug");
    const quantity = searchParams.get("quantity");
    const cart = searchParams.get("cart");

    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
      const loadCheckoutItems = async () => {
        if (itemSlug && quantity){
          const data = await dispatch(getSingleProduct({slug: itemSlug})).unwrap();
          const safeQuantity = Math.min(Number(quantity), data.product.stock);
          if (data.product.seller._id !== userInfo?._id){
            setCheckoutItems([{
              product: data.product,
              quantity: safeQuantity
            }]);
          }
          else{
            toast.error("You are trying to buy your own product.");
          }
        }
        else{
          setCheckoutItems(cartItems.filter(item => (item.product !== null && item.product.stock > 0)));
        }
        setLoading(false);
      }
      loadCheckoutItems();
    }, [cartItems, itemSlug, quantity])
    
    const [formatedPrice, setFormatedPrice] = useState("");
    useEffect(() => {
      if (checkoutItems.length && checkoutItems[0].product){
        const totalPrice = checkoutItems.reduce((sum, item) => {
          if (item.product.stock < 1) return sum;
          return sum + (item.product.price / 100).toFixed(2) * item.quantity;
        }, 0);
        const fixedPrice = Number(totalPrice.toFixed(2));
        const formatedPriceCart = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }).format(fixedPrice);
        setFormatedPrice(formatedPriceCart);
      }
    }, [checkoutItems])

    const [enterShippingInfo, setEnterShippingInfo] = useState(true);
    const [shippingInfo, setShippingInfo] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [overQuantity, setOverQuantity] = useState(false);

    const handleChecking = () =>{
      setIsChecked(!isChecked);
    }

    const confirmAndPay = async () => {
      if (overQuantity){
        toast.warn("Update the quantities of the products that you have selected.");
        return;
      }
      setPaymentLoading(true);
      const valueToPay = parseFloat(formatedPrice.replace(/[$,]/g, ""));
      const valueToPayInCent = valueToPay * 100;
      if (userInfo.walletBalance >= valueToPayInCent){
        try{
          const newOrder = await axiosInstance.post("/order/", {items: checkoutItems, shippingAddress: shippingInfo, paymentProvider: "internal"});
          if (isChecked){
            const accountShippingInfoUpdateData = {
              userId: userInfo._id,
              country: shippingInfo.country,
              city: shippingInfo.city,
              street: shippingInfo.street,
              postalCode: shippingInfo.postalCode
            }
            dispatch(updateAccount(accountShippingInfoUpdateData));
          }
          await axiosInstance.post(`/order/${newOrder.data.order._id}/pay`, {oneItem: itemSlug ? true : false, fromCart: cart === "true" ? true : false});
          setPaymentLoading(false);
          window.location.href = `/order/${newOrder.data.order._id}?paymentSuccess=true`;
        }
        catch(err){
          console.error(err);
          toast.error(err.response.data.message);
          setPaymentLoading(false);
        }
      }
      else{
        setPaymentLoading(false);
        const insufficientValue = parseFloat((valueToPayInCent - userInfo.walletBalance).toFixed(2));
        dispatch(clearInsufficientValue());
        dispatch(openGeneralPopUp("add-funds"));
        dispatch(setinsufficientValue(insufficientValue));
      }
    }

    if (userInfo.isAdmin){
      return (
        <div className='no-admin-allowance'>
          <MarketLogo />
          <p className='allowance-message'>Admins can not checkout since they don't buy products!</p>
        </div>
      )
    }

    return (
      <div className="checkout-page">
        <PageTitle title="Checkout | RB Market" />
        <PayMethodAction from={"/cart?"}/>
        <div className="checkout-navbar">
            <MarketLogo />
            <h2>Checkout</h2>
        </div>


        {loading ? 
          <div className='auth-loading-screen'>
            <CircularProgress size={40} thickness={5} />
          </div>
          :
          checkoutItems.length < 1 ?
              <div className="checkout-no-items">
                  <span>
                      <InfoIcon />
                  </span>
                  <p>
                      Something went wrong. Please try to check out again.
                  </p>
              </div>
            :
            <>
              <div className="cart-items-checkout">
                <div className="checkout-left">
                  <CartItems usage="checkout" items={checkoutItems} setOverQuantity={setOverQuantity}/>
                  <ShippingLayout enterShippingInfo={enterShippingInfo} 
                                  setEnterShippingInfo={setEnterShippingInfo} 
                                  shippingInfo={shippingInfo} 
                                  setShippingInfo={setShippingInfo}
                                  isChecked={isChecked}
                                  handleChecking={handleChecking}
                                  /> 
                </div>
                <div className="checkout-right">
                  <OrderDetails type="checkout"
                              loading={paymentLoading}
                              disabled={enterShippingInfo}
                              itemsLength={checkoutItems.length}
                              formatedPrice={formatedPrice}
                              onSubmit={confirmAndPay}
                  />    
                </div>
              </div>

              <Footer />
            </>
        }
        
      </div>
    )
}

export default Checkout;