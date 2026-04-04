import Navbar from "../../components/Navbar/navbar";
import "./cart.css";
import InfoIcon from '@mui/icons-material/Info';
import { useEffect, useState } from "react";
import Footer from "../../components/Footer/footer";
import CartItems from "../../components/CartItems/cartItems";
import OrderDetails from "../../components/OrderDetails/orderDetails";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { resetMessages } from "../../redux/features/cartSlice";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import { clearInsufficientValue, openGeneralPopUp, setinsufficientValue } from "../../redux/features/uiSlice";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Cart = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const { items: cartItems, cartBadge, loading: cartLoading, error } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.user);
    const [overQuantity, setOverQuantity] = useState(false);

    useEffect(() => {
      if (error) toast.error(error);
      dispatch(resetMessages());
    }, [error])
    
    const finalCartItems = cartItems.filter(item => item.product !== null);

    const [formatedPrice, setFormatedPrice] = useState("");
    useEffect(() => {
      if (finalCartItems.length){
        const totalPrice = finalCartItems.reduce((sum, item) => {
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
    }, [finalCartItems])

    const handleSignIn = () => {
      navigate("/sign-in", {
        state: {
          from: location.pathname
        }
      })
    }

    const submitBtn = async () => {
        if (isAuthenticated){
          if (overQuantity){
            toast.warn("Update the quantities of the products that you have selected.");
            return;
          }
          const valueToPay = parseFloat(formatedPrice.replace(/[$,]/g, ""));
          const valueToPayInCent = valueToPay * 100;
          if (userInfo.walletBalance >= valueToPayInCent){
            navigate("/checkout");
          }
          else{
            const insufficientValue = parseFloat((valueToPayInCent - userInfo.walletBalance).toFixed(2));
            dispatch(clearInsufficientValue());
            dispatch(openGeneralPopUp("add-funds"));
            dispatch(setinsufficientValue(insufficientValue));
          }
        }
        else{
          navigate("/sign-in", {
            state: {
                from: `/checkout`
            }
        })
        }
    }

    if (userInfo.isAdmin){
      return (
        <div className='no-admin-allowance'>
          <MarketLogo />
          <p className='allowance-message'>Admins can not have a cart since they don't buy products!</p>
        </div>
      )
    }
 
    return (
      <div className="cart-page-container">
        <div className="cart-page-footer-wrapper">
          <PageTitle title="My Cart | RB Market" />
          <PayMethodAction from={"/cart?"} />
          <Navbar />

          <div className="cart-page">
              <h1>Shopping cart</h1>
              
              {cartLoading ? 
                <div className='auth-loading-screen'>
                  <CircularProgress size={40} thickness={5} />
                </div>
                :
                finalCartItems.length > 0 ? 
                  <>
                      {!isAuthenticated &&
                          <div className="not-signed-in-cart">
                              <span>
                                  <InfoIcon />
                              </span>
                              <p>
                                  You're signed out right now. To save these items or see your previously saved items, <button onClick={handleSignIn}>sign in</button>.
                              </p>
                          </div>
                      }
                      <div className="cart-page-wrapper">
                        <div className="cart-left">
                          <CartItems usage="cart" items={finalCartItems} loading={cartLoading} setOverQuantity={setOverQuantity}/>
                        </div>
                        <div className="cart-right">
                          <OrderDetails type="cart"
                              disabled={formatedPrice === "$0.00"}
                              itemsLength={cartBadge}
                              formatedPrice={formatedPrice}
                              onSubmit={submitBtn}
                          /> 
                        </div>
                      </div>
                  </>
                  :
                  <div className="no-cart-items">
                      <h3>You don't have any items saved in your cart.</h3>
                      {!isAuthenticated && <>
                          <p>Have an account? Sign in to see your items.</p>
                          <div className="settings-btns no-cart-items-btns">
                              <Link className="cancel-settings" to="/shopping" role="button">Start shopping</Link>
                              <Link className="save-settings" to="/sign-in" role="button">Sign in</Link>
                          </div>
                      </>
                      }
                  </div>
              }  
          </div>
        </div>

        <Footer />
      </div>
    )
}

export default Cart;