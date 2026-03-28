import "./navbar.css";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarketLogo from "../MarketLogo/marketLogo";
import SearchBar from "../SearchBar/searchBar";
import CategoriesBtn from "../Categories/categoriesBtn";
import HoverMenu from "../HoverMenu/hoverMenu";
import { useEffect, useRef, useState } from "react";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import defaultProfilePic from "../../../public/assets/defaultPerson.jpg";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import useDropdown from "../../hooks/useDropdown";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import { openGeneralPopUp, closeGeneralPopUp, clearInsufficientValue, setinsufficientValue } from "../../redux/features/uiSlice";
import { logoutUser, reset2FAState } from "../../redux/features/authSlice";
import { getAllCategories } from "../../redux/features/categorySlice";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDebounce from "../../utils/helper";
import socket from "../../socket";
import { resetSearch, resetMessages, getAllProducts } from "../../redux/features/productSlice";
import { removeFromCart, clearGuestCart, clearCart, removeFromCartCall } from "../../redux/features/cartSlice";
import { addRealTimeNotification, deleteAllNotifications, deleteANotification, getAllNotifications, getUnreadNotifications, readAllNotifications, readANotification } from "../../redux/features/notificationSlice";

const Navbar = ({usage}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const generalPopUp = useSelector((state) => state.ui.generalPopUp);
    const { isAuthenticated, error } = useSelector((state) => state.auth);
    const { userInfo } = useSelector((state) => state.user);
    const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
    const { products, nextSkip, loading: searchLoading, hasMore, successMessage } = useSelector((state) => state.product.search);
    const { items: cartItems, cartBadge, loading: cartLoading } = useSelector((state) => state.cart);
    const {notifications: notificationsItems, unreadCount} = useSelector((state) => state.notification);

    const accountItems = [
      { 
        _id: 1,
        text: "Profile",
        link: `/profile/${userInfo.slug}`,
        icon: <AccountBoxIcon />
      },
      { 
        _id: 2,
        text: "Orders",
        link: "/orders",
        icon: <LocalGroceryStoreIcon />
      },
      { 
        _id: 3,
        text: "Settings",
        link: "/settings",
        icon: <SettingsIcon />
      },
      { 
        _id: 4,
        text: "Admin",
        link: "/admin",
        icon: <AdminPanelSettingsIcon />
      },
      { 
        _id: 5,
        text: "Sign out",
        icon: <LogoutIcon />
      }
    ]

    const isHome = usage === "home";
    const isAdminUser = userInfo.isAdmin;

    const [isSmallWindow, setIsSmallWindow] = useState(window.innerWidth <= 680);

    const [openCategories, setOpenCategories] = useState(false);
    const categoriesWrapper = useRef();

    const account = useDropdown();
    const notifications = useDropdown();
    const cart = useDropdown();
    const search = useDropdown();
    const [searchValue, setSearchValue] = useState('');
    const debouncedQuery = useDebounce(searchValue, searchValue === "" ? 0 : 400);
    const [loadMore, setLoadMore] = useState(false);

    useEffect(() => {
      if (location.state?.cartPopUp === "open"){
          setTimeout(() => {  
            cart.setIsOpen(true);
          }, 300);
      }
      else if (location.state?.notificationPopUp === "open"){
        setTimeout(() => {  
            notifications.setIsOpen(true);
        }, 300);
      }
    }, [])

    useEffect(() => {
      if (openCategories && categories.length === 0){
        dispatch(getAllCategories());
      }
    }, [openCategories])

    useEffect(() => {
        const handleMouseLeave = (e) => {
          if (categoriesWrapper.current && !categoriesWrapper.current.contains(e.relatedTarget)) {
            setOpenCategories(false);
          }
        };

        const node = categoriesWrapper.current;
        if (node) {
          node.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
          if (node) {
            node.removeEventListener('mouseleave', handleMouseLeave);
          }
        };
    }, [])

    useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 680px)");

      const handleChange = (e) => {
        setIsSmallWindow(e.matches);
      
        if (!e.matches) {
          if (["search", "notifications", "cart"].includes(generalPopUp)) {
            dispatch(closeGeneralPopUp());
          }
        }
      };
    
      setIsSmallWindow(mediaQuery.matches);
    
      mediaQuery.addEventListener("change", handleChange);
    
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, [dispatch, generalPopUp]);

    const handleSearchChange = (e) => {
      setSearchValue(e.target.value);
      if (e.target.value.length > 0){
        search.setIsOpen(true);
      }
      else{
        search.setIsOpen(false);
      }
    }

    const handleSearchClick = () => {
      if (isSmallWindow){
        dispatch(openGeneralPopUp("search"));
      }
      
      if (searchValue.length !== 0){
        search.setIsOpen(true);
        if (isSmallWindow){
          dispatch(openGeneralPopUp("search"));
        }
      }
    }

    const clearSearchBar = () => {
      setSearchValue('');
      dispatch(resetSearch());
      dispatch(resetMessages());
      search.setIsOpen(false);
    }

    const handleSearching = (text, id) => {
      setSearchValue(text);
      search.setIsOpen(false);
      dispatch(openGeneralPopUp(false));
    }

    const handleSearchEnter = (value) => {
      dispatch(openGeneralPopUp(false));
      navigate("/shopping?search=" + encodeURIComponent(value));
    }

    useEffect(() => {
      dispatch(resetSearch());
      dispatch(resetMessages());
    }, [location]);

    useEffect(() => {
      if (!debouncedQuery) return;
      dispatch(getAllProducts({title: debouncedQuery, skip: 0, globalSearch: true}));
    }, [debouncedQuery]);

    useEffect(() => {
      if (!loadMore || !debouncedQuery) return;
      dispatch(getAllProducts({title: debouncedQuery, skip: nextSkip, append: true, globalSearch: true}))
      .finally(() => setLoadMore(false));
    }, [loadMore]);

    const handleLogout = async (id) => {
      if (id === 5){
        try{
          await dispatch(logoutUser()).unwrap();
        }
        catch (err) {
          toast.error(error || "Logout failed");
          console.log(err);
        }
        
        dispatch(reset2FAState());
        dispatch(closeGeneralPopUp());
        dispatch(clearGuestCart());
        navigate("/sign-in");
      }
    }

    const [hasFetched, setHasFetched] = useState(false);
    useEffect(() => {
      if (!userInfo?._id) return;
      if (notificationsItems.length === 0 && !hasFetched){
        dispatch(getAllNotifications());
        dispatch(getUnreadNotifications());
        setHasFetched(true);
      }
    }, [userInfo, hasFetched]);

    useEffect(() => {
      if (!userInfo?._id) return;

      const handleNotification = (data) => {
        dispatch(addRealTimeNotification(data));
        const audio = new Audio("/public/assets/notification.wav");
        audio.play();
      }
      socket.on("notification", handleNotification)

      return () => {
        socket.off("notification", handleNotification);
      }
    }, [userInfo, dispatch])

    const hanldeReadANotification = (id) => {
      dispatch(readANotification({notificationId: id}));
    }

    const handleClickNotification = (name, id) => {
      dispatch(readANotification({notificationId: id}));
      if (generalPopUp === "notifications"){
        dispatch(closeGeneralPopUp());
      }
    }

    const handleReadAllNotifications = () => {
      dispatch(readAllNotifications());
    }

    const handleDeleteNotificationItem = (id) => {
      setTimeout(() => {
        dispatch(deleteANotification({notificationId: id}));
      }, 400); // time of the remove item animation is 0.4 sec in the css file
    }

    const handleDeleteAllNotifications = () => {
      dispatch(deleteAllNotifications());
    }

    const handleCartPopUp = () => {
      cart.setIsOpen(!cart.isOpen);
      if (isSmallWindow){
        dispatch(openGeneralPopUp("cart"));
      }
    }

    const handleDeleteCartItem = (id) => {
      if (!isAuthenticated){
        setTimeout(() => {
          dispatch(removeFromCart(id));
        }, 700); // time of the remove item animation is 0.7 sec in the css file
      }
      else{
        setTimeout(() => {
          dispatch(removeFromCartCall(id));
        }, 700);
      }
    }

    const handleClearAllCartItems = () => {
      if (!isAuthenticated){
        dispatch(clearGuestCart());
      }
      else{
        dispatch(clearCart());
      }
    }

    const handleClickCartItem = (name, id) => {
      if (generalPopUp === "cart"){
        dispatch(closeGeneralPopUp());
      }
    }

    const [overQuantity, setOverQuantity] = useState(false);
    useEffect(() => {
        const hasOverQuantity = cartItems.some(item => item.product?.stock < item.quantity);
        setOverQuantity(hasOverQuantity);
    }, [cartItems])

    const [formatedPrice, setFormatedPrice] = useState("");
    useEffect(() => {
      if (cartItems.length){
         const totalPrice = cartItems.reduce((sum, item) => {
          if (!item.product) return sum;
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
    }, [cartItems])

    const gotoCart = () => {
      navigate("/cart");
      dispatch(closeGeneralPopUp());
    }

    const goToCheckout = () => {
      if (overQuantity){
        toast.warn("Update the quantities of the products that you have selected.");
        return;
      }
      const valueToPay = parseFloat(formatedPrice.replace(/[$,]/g, ""));
      const valueToPayInCent = valueToPay * 100;
      if (userInfo.walletBalance >= valueToPayInCent){
          navigate("/checkout");
          dispatch(closeGeneralPopUp());
      }
      else{
          const insufficientValue = parseFloat((valueToPayInCent - userInfo.walletBalance).toFixed(2));
          dispatch(clearInsufficientValue());
          dispatch(openGeneralPopUp("add-funds"));
          dispatch(setinsufficientValue(insufficientValue));
      }  
    } 

  return (
    <nav className={`${isHome ? 'navbar' : ''}`}>
        <div className={`nav-container usage-${usage}`}>   
            <div className="leftSide-nav">           
                <MarketLogo navbar={true}/>
                {!isAdminUser &&
                  <div className="container-wrapper categories-btn-section" ref={categoriesWrapper} onMouseEnter={() => setOpenCategories(true)}>
                      <CategoriesBtn btnOn={openCategories}/>
                      {openCategories && <HoverMenu menu="categories" items={categories} loading={categoriesLoading} />}
                  </div>
                }
            </div>
  
            <div className='center-nav' ref={search.ref}>
              <div className="container-wrapper">
                {isSmallWindow ? 
                  <>
                    <div className="demo-searchbar" onClick={handleSearchClick}>
                      <span><SearchIcon fontSize="small" style={{marginTop: "3px"}}/></span>
                      <p>{searchValue === "" ? "Search for anything" : searchValue}</p>
                    </div>
                    {generalPopUp === "search" && 
                      <GeneralPopUp usage="searchBar"
                            showLastBtns={false} 
                            closePopUp={() => dispatch(closeGeneralPopUp())}
                            content={() => (
                              <div className="container-wrapper popup-content">
                                <SearchBar value={searchValue} 
                                          onChange={handleSearchChange} 
                                          onClear={clearSearchBar} 
                                          onClick={handleSearchClick}
                                          onSearch={handleSearchEnter} 
                                          placeholder="Search for anything"/>
                                {search.isOpen && 
                                  <HoverMenu menu="searchbar-popup" 
                                            items={products} 
                                            onClickItem={handleSearching} 
                                            loading={searchLoading}
                                            seeMore={hasMore}
                                            noResult={successMessage}
                                            onLoadMore={() => setLoadMore(true)}/>}
                              </div>
                            )}
                     />
                    }
                  </>
                  :
                  <>
                    <SearchBar value={searchValue} 
                          onChange={handleSearchChange} 
                          onClear={clearSearchBar} 
                          onClick={handleSearchClick}
                          onSearch={handleSearchEnter} 
                          placeholder="Search for anything"/>           
                    {search.isOpen && 
                      <HoverMenu menu="searchbar" 
                                items={products} 
                                onClickItem={handleSearching} 
                                loading={searchLoading}
                                seeMore={hasMore}
                                noResult={successMessage}
                                onLoadMore={() => setLoadMore(true)}
                                />}
                  </>
                }
              </div>  
            </div>
 
            <div className='rightSide-nav'>
                <div className="account-btn container-wrapper" ref={account.ref}>
                    <button className="btn nav-btns nav-account-btn" title="Account" onClick={() => account.setIsOpen(!account.isOpen)}>
                      <img className="nav-profile-pic-btn" 
                          alt="Profile Photo"
                          src={isAuthenticated ? 
                                userInfo?.avatar ? userInfo?.avatar : defaultProfilePic
                                :
                                defaultProfilePic
                              }
                          onError={(e) => {e.currentTarget.src = defaultProfilePic}} 
                          />
                    </button>
                    {account.isOpen && 
                      <HoverMenu menu="account" items={accountItems} isAuthenticated={isAuthenticated} onClickItem={handleLogout}/>
                    }
                </div>
                <div className="notification-btn container-wrapper" ref={notifications.ref}>
                    <button className="btn nav-btns" 
                            title="Notifications" 
                            onClick={() => {notifications.setIsOpen(!notifications.isOpen), 
                                            isSmallWindow && dispatch(openGeneralPopUp("notifications"))
                            }}>
                      <NotificationsIcon />
                    </button>
                    {isAuthenticated &&
                      <span className="badge">{unreadCount}</span>
                    }
                    {isSmallWindow ? 
                      generalPopUp === "notifications" &&
                        <GeneralPopUp usage="notifications"
                              showLastBtns={false} 
                              closePopUp={() => dispatch(closeGeneralPopUp())}
                              content={() => (
                                <div className="container-wrapper">
                                  <HoverMenu menu="notifications-popup" 
                                    items={notificationsItems}
                                    onRead={hanldeReadANotification}
                                    onClickItem={handleClickNotification}
                                    onReadAll={handleReadAllNotifications}
                                    unreadCount={unreadCount}  
                                    onDeleteItem={handleDeleteNotificationItem}
                                    onClearAllItems={handleDeleteAllNotifications} 
                                    isAuthenticated={isAuthenticated}
                                  />
                                </div>
                              )}
                        />
                    :
                      notifications.isOpen && 
                        <HoverMenu menu="notifications" 
                                  items={notificationsItems}
                                  onRead={hanldeReadANotification}
                                  onClickItem={handleClickNotification}
                                  onReadAll={handleReadAllNotifications}
                                  unreadCount={unreadCount} 
                                  onDeleteItem={handleDeleteNotificationItem}
                                  onClearAllItems={handleDeleteAllNotifications} 
                                  isAuthenticated={isAuthenticated}
                        />
                    }
                </div>
                {!isAdminUser &&
                  <div className="cart-btn container-wrapper" ref={cart.ref}>
                      <button className="btn nav-btns" 
                              title="Cart"
                              onClick={handleCartPopUp} 
                              >
                        <ShoppingCartIcon />
                      </button>
                      <span className="badge">{cartBadge}</span>
                      {isSmallWindow ? 
                        generalPopUp === "cart" &&
                          <GeneralPopUp usage="cart"
                                showLastBtns={cartItems.length > 0 ? true : false}
                                cancelBtnText="View cart"
                                saveBtnText="Checkout"
                                onCancel={gotoCart}
                                onSave={goToCheckout} 
                                closePopUp={() => dispatch(closeGeneralPopUp())}
                                content={() => (
                                  <div className="container-wrapper">
                                    <HoverMenu menu="cart-popup" 
                                        items={cartItems}
                                        onDeleteItem={handleDeleteCartItem}
                                        onClearAllItems={handleClearAllCartItems}
                                        onClickItem={handleClickCartItem} 
                                        isAuthenticated={isAuthenticated}
                                    />
                                    {cartItems.length > 0 &&
                                    <>
                                      {!isAuthenticated &&
                                        <div className='logged-out-cart'>
                                            <p>You're signed out right now. To save these items or see your previously saved items, <Link to="/sign-in">Sign in</Link>.</p>
                                        </div>
                                      }
                                      <div className='cart-total-price-popup'>
                                          <p>Total</p>
                                          <p>{formatedPrice}</p>
                                      </div>
                                    </>
                                    }
                                  </div>
                                )}
                          />
                      :
                        cart.isOpen && 
                          <HoverMenu menu="cart" 
                                    items={cartItems}
                                    loading={cartLoading}
                                    totalPrice={formatedPrice}
                                    overQuantity={overQuantity} 
                                    onDeleteItem={handleDeleteCartItem} 
                                    onClearAllItems={handleClearAllCartItems}
                                    isAuthenticated={isAuthenticated}
                          />
                      }
                  </div>
                }
            </div>
        </div>
    </nav>
  )
}

export default Navbar;