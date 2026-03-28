import { useEffect, useState } from 'react'
import "./app.css"
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import Home from './pages/Home/home'
import Profile from './pages/Profile/profile'
import Settings from './pages/Settings/settings'
import Login from './pages/Login/login'
import Register from './pages/Register/register'
import Shopping from './pages/Shopping/shopping'
import Item from './pages/Item/item'
import ToastNotification from './components/ToastNotification/toastNotification'
import Cart from './pages/Cart/cart'
import Checkout from './pages/Checkout/checkout'
import SellingDashboard from './pages/SellingDashboard/sellingDashboard'
import ListItem from './pages/ListItem/listItem'
import { useDispatch, useSelector } from "react-redux";
import ResetPassword from './pages/ResetPassword/resetPassword'
import ScrollToTop from "./components/ScrollToTop/scrollToTop";
import VerifyEmail from './pages/VerifyEmail/verifyEmail'
import AuthRedirectListener from './components/AuthRedirectListener/authRedirectListener'
import Admin from './pages/Admin/admin'
import UpdateUser from './pages/UpdateUser/updateUser'
import BrandCategory from './pages/Brand&Category/brand&category'
import Orders from './pages/Orders/orders'
import Order from './pages/Order/order'
import TermsofService from './pages/FooterPages/TermsofService/termsofService'
import PrivacyPolicy from './pages/FooterPages/PrivacyPolicy/privacyPolicy'
import socket from "./socket";
import { toast } from 'react-toastify'
import { setWallet } from './redux/features/userSlice'
import Transaction from './pages/Transaction/transaction'

function App() {
  
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);
  const generalPopUp = useSelector((state) => state.ui.generalPopUp);

  useEffect(() => {
    if (generalPopUp) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px"; 
    };
  }, [generalPopUp]);

  useEffect(() => {
    if (userInfo){
      socket.emit("register", userInfo._id);

      if (userInfo.accountStatus === "frozen"){
        toast.warn("You account has been frozen!");
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo?._id) return;

    const handleBalanceUpdate = (data) => {
      dispatch(setWallet(data.newBalance));
    }

    socket.on("balanceUpdate", handleBalanceUpdate);

    return () => {
      socket.off("balanceUpdate", handleBalanceUpdate);
    }
  }, [userInfo, dispatch])

  return (
    <Router>
      <AuthRedirectListener />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/profile/:slug' element={isAuthenticated ? <Profile /> : <Login />}></Route>
        <Route path='/settings' element={isAuthenticated ? <Settings /> : <Login />}></Route>
        <Route path='/shopping' element={<Shopping />}></Route>
        <Route path='/cart' element={<Cart />}></Route>
        <Route path='/selling' element={isAuthenticated ? <SellingDashboard /> : <Login />}></Route>
        <Route path='/list-item' element={isAuthenticated ? <ListItem /> : <Login />}></Route>
        <Route path='/checkout' element={<Checkout />}></Route>
        <Route path='/item/:itemSlug' element={<Item />}></Route>
        <Route path='/orders' element={isAuthenticated ? <Orders /> : <Login />}></Route>
        <Route path='/order/:orderId' element={isAuthenticated ? <Order /> : <Login />}></Route>
        <Route path='/transaction/:transactionId' element={isAuthenticated ? <Transaction /> : <Login />}></Route>

        <Route path='/reset-password/:token' element={isAuthenticated ? <Navigate to="/" replace={true}/> : <ResetPassword />}></Route>
        <Route path='/verify-email/:token' element={isAuthenticated ? <VerifyEmail /> : <Login />}></Route>

        <Route path='/privacy-policy' element={<PrivacyPolicy />}></Route>
        <Route path='/terms-of-service' element={<TermsofService />}></Route>

        <Route path='/sign-in' element={<Login />}></Route>
        <Route path='/sign-up' element={<Register />}></Route>

        <Route path='/admin' element={isAuthenticated ? <Admin /> : <Login />}></Route>
        <Route path='/updateuser' element={isAuthenticated ? <UpdateUser /> : <Login />}></Route>
        <Route path='/brand-category' element={isAuthenticated ? <BrandCategory /> : <Login />}></Route>

        <Route path="*" element={<Navigate to="/" replace={true}/>}></Route>
      </Routes>

      <ToastNotification />
    </Router>
  )
}

export default App;