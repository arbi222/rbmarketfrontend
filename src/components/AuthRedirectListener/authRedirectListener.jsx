import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchCurrentUser, resetSuccess } from "../../redux/features/authSlice";
import { mergeGuestCartIfExists, redirectAfterLogin } from "../../utils/helper";
import { fetchUserCart, hydrateGuestCart } from "../../redux/features/cartSlice";
import { CircularProgress } from "@mui/material";

const AuthRedirectListener = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthChecked, successMessage } = useSelector((state) => state.auth);
  const { userInfo } = useSelector((state) => state.user);
  const { guestItems, hydrated } = useSelector((state) => state.cart);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("googleAuth") === "true") {
        const googleAuth = async () => {
            try{
              const redirectState = JSON.parse(sessionStorage.getItem("postAuthRedirect"));
              await dispatch(fetchCurrentUser()).unwrap();
              mergeGuestCartIfExists(dispatch);
              if (redirectState?.from){
                redirectAfterLogin(navigate, {state: redirectState});
              }
              else{
                window.history.replaceState({}, document.title, "/");
              }
            }
            catch(err){
              console.error(err);
            }
            finally{
                sessionStorage.removeItem("postAuthRedirect");
                toast.success("Logged in successfully.");
            }
        }
        googleAuth();
    }
    else{
      dispatch(fetchCurrentUser());
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecked) return;
    
    if (isAuthenticated) {
      if (userInfo.isAdmin) return;
      dispatch(fetchUserCart());
      return;
    } 
    else {
      if (guestItems.length && !hydrated) {
        dispatch(hydrateGuestCart(guestItems));
      }
    }
  }, [isAuthChecked, isAuthenticated, guestItems, hydrated]);


  useEffect(() => {
      if (successMessage) {
        toast.success(successMessage);
        dispatch(resetSuccess());
      }
  }, [successMessage]);

  if (!isAuthChecked) {
    return (
      <div className='auth-loading-screen'>
        <CircularProgress size={40} thickness={5} />
      </div>
    )
  }

  return null;
};

export default AuthRedirectListener;