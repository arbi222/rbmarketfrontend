import React, { useEffect, useState } from 'react'
import "./hoverMenu.css";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from '@mui/icons-material/Search';
import { CircularProgress } from '@mui/material';
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearInsufficientValue, openGeneralPopUp, setinsufficientValue } from '../../redux/features/uiSlice';
import { toast } from 'react-toastify';
import { timeAgo } from '../../utils/helper';

const HoverMenu = ({menu, items, onClickItem, onDeleteItem, onRead, onReadAll, unreadCount, onClearAllItems, totalPrice, 
                    overQuantity, isAuthenticated, loading, onLoadMore, seeMore, noResult}) => {

    const { userInfo } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [deletedIndex, setDeletedIndex] = useState(null);

    const isNotifications = menu === "notifications";
    const isNotificationsPopUp = menu === "notifications-popup";
    const isCart = menu === "cart";
    const isCartPopUp = menu === "cart-popup";
    const isSearch = menu === "searchbar";
    const isSearchPopUp = menu === "searchbar-popup";
    const isCategories = menu === "categories";
    const isListingCategories = menu === "listing-categories";
    const isAccount = menu === "account";
    const isReviewSettings = menu === "reviewSettings";

    const isNotificationBar = isNotifications || isNotificationsPopUp;
    const isSearchBar = isSearch || isSearchPopUp;
    const isCartBar = isCart || isCartPopUp;
    const isCategoriesGroup = isCategories || isListingCategories;

    const isNavigable = isCategories || isSearchBar || isCartBar || isAccount || isNotificationBar;

    let deletedItems = 0;
    if (isCartBar){
        deletedItems = items.filter(item => item.product === null).length;
    }
    
    const handleSignInCart = () => {
        navigate("/sign-in", {
            state: {
                cartPopUp: "open"
            }
        })
    }

    const handleSignInNotifications = () => {
        navigate("/sign-in", {
            state: {
                notificationPopUp: "open"
            }
        })
    }
    
    const goToCheckoutPage = () => {
        if (!isCart) return;
        if (overQuantity){
            toast.warn("Update the quantities of the products that you have selected.");
            return;
        }
        const valueToPay = parseFloat(totalPrice.replace(/[$,]/g, ""));
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

    if (loading && isCategoriesGroup) {
        return (
            <div className={`hoverMenu ${menu}-style`}>
                <div className={`${menu}-loading`}>
                    <CircularProgress size={30} thickness={5} />
                 </div>
            </div>
        )
    }

    return (
      <div className={`hoverMenu ${menu}-style 
                        ${isNotifications || isListingCategories || isCategories ? "scroll-bar" : ""} 
                        ${isAccount && !isAuthenticated ? "not-authenticated-account" : ""}`
                    }>
        {!isAccount && !isListingCategories && !isSearchBar && !isReviewSettings && items.length > 0 &&
            <div className={`${menu}-menuWrapper`}>
                <div className={`menuTitle ${isNotificationsPopUp ? "notification-popup-menuTitle" : ""}`}>
                    {menu.split("-")[0].charAt(0).toUpperCase() + menu.split("-")[0].slice(1)}
                </div>
                {isNotificationBar && items.length > 0 && isAuthenticated && 
                    <div className='notification-btn-wrapper'>
                        {unreadCount > 0 &&
                            <button className='btn notification-btns' title='Mark all as read' onClick={onReadAll}>
                                <PlaylistAddCheckIcon />
                            </button>
                        }
                        <button className='btn notification-btns' title='Clear all notifications' onClick={onClearAllItems}>
                            <ClearAllIcon />
                        </button>
                    </div>
                }
                {isCartBar && items.length > 0 &&
                    <div className='cart-btn-wrapper'>
                        <button className='btn cart-clear-btn' title='Clear cart' onClick={onClearAllItems}>
                            <ClearAllIcon />
                        </button>
                    </div>
                }
            </div>
        }

        {isCartBar && loading &&
            <div className={`${menu}-loading`}>
                <CircularProgress size={30} thickness={5} />
            </div>
        }

        <div className={`${menu}-components ${isCartBar || isSearchBar || isNotificationsPopUp ? "scroll-bar" : ""} ${isSearchBar ? "search-scroll-handler" : ""}`}>
            {(isNotificationBar || isAccount) && !isAuthenticated ? (
                <div className={`${menu}-empty-state`}>
                    {isNotificationBar 
                     ?  <p>Please <button className='empty-state-login' onClick={handleSignInNotifications}>sign in</button> to view your notifications.</p>
                     :  
                     <div className='login-message'>
                        <Link className='btn sign-in' to="/sign-in">Sign in</Link>
                        <hr />
                        <Link className='btn sign-up' to="/sign-up">Sign up</Link>
                     </div>
                    }
                </div> 
                ) : 
                (isNotificationBar || isCartBar || isCategoriesGroup) && items.length === 0 ? (
                    <div className={`${menu}-empty-state`}>
                        {isNotificationBar && <p>You have no notifications right now.</p>}
                        {isCartBar && <p>Your cart is empty. <br />Time to start shopping!</p>}
                        {isCategoriesGroup && <p>There are no categories available now.</p>}
                    </div>
                ) : (
                    items.map((item, i) => {
                        const getItemId = (item) => {
                            if (item?._id) return item._id;                 
                            if (item?.product?._id) return item.product._id;
                            return item?.id;                              
                        };

                        const itemId = getItemId(item);

                        if (isAccount && item._id === 4 && !userInfo.isAdmin){
                            return null;
                        }

                        if (isAccount && item._id === 2 && userInfo.isAdmin){
                            return null;
                        }

                        if (isCartBar && item.product === null){
                            return null;
                        }
                        
                        return (
 
                        <div key={itemId || i} 
                            className={`${menu}-element ${(isNotificationBar || isCartBar) && deletedIndex === itemId ? `delete-${menu}-animation` : ""}`} 
                            onMouseEnter={() => setHoveredIndex(itemId || i)} 
                            onMouseLeave={() => setHoveredIndex(null)}>
                            <div className={`${menu}-inside-element`}>
                                {(isAccount || isReviewSettings) && i === items.length - 1 && items.length > 1 && <hr className='account-hr'/> }
                                {isNavigable?
                                    <Link to={isCategories ? "/shopping?category=" + encodeURIComponent(item.name) + "&categoryId=" + item._id + "&linkFetch=true" :
                                            isSearchBar ? "/shopping?search=" + encodeURIComponent(item.title) : 
                                            isCartBar ? "/item/" + item.product.slug 
                                            : 
                                            item.link
                                        } 
                                        className={`btn ${menu}-item`} 
                                        onClick={() => isAccount ? onClickItem(item._id) : onClickItem && onClickItem(item?.title || item?.name, item._id)}
                                    >
                                        {isSearchBar ? 
                                            <div className='searchbar-align-icon'>
                                                <SearchIcon fontSize='small'/> 
                                                <span>{item.title}</span>
                                            </div> 
                                            : 
                                            <div className={`${menu}-inside-item`}>
                                                {isCartBar &&
                                                    <img className='cart-item-image' 
                                                        src={item.product.image || defaultProductPicture} 
                                                        alt="Cart Item" 
                                                        onError={(e) => {e.currentTarget.src = defaultProductPicture}}/>
                                                }
                                                <div className={`${menu}-item-arrange`}>
                                                    {isAccount &&
                                                        item.icon
                                                    }
                                                    <span className={`${menu}-item-name ${(isNotificationBar && !item?.read) ? "unread-message" : ""}`}>
                                                        {item?.text || item?.name || item?.product?.title || item?.message}
                                                    </span>
                                                    {isCartBar && (
                                                        item.product.stock > 0 ?
                                                            <div className='cart-item-details'>
                                                                <span>${(item.product.price / 100).toFixed(2)}</span>
                                                                <span>x</span>
                                                                <span className={`quantity ${item.product.stock < item.quantity ? "over-quantity" : ""}`}>Qty:{item.quantity}</span>
                                                                <span>=</span>
                                                                <span>${(item.quantity * (item.product.price / 100).toFixed(2)).toFixed(2)}</span>
                                                            </div>
                                                            :
                                                            <div className='cart-item-details'>
                                                                <span>${item.product.price}</span>
                                                                <span>Out of stock</span>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </Link>
                                    :
                                    <button className={`btn ${menu}-item`} onClick={() => onClickItem(item._id, item.name)}> 
                                        <div className={`${menu}-item-arrange`}>
                                            {item.icon}
                                            <span className={`${menu}-item-name`}>{item.text || item.name}</span>
                                        </div> 
                                    </button>
                                }
                                {isNotificationBar && <span className='notification-timestamp'>{timeAgo(item.createdAt)}</span>}
                            </div>
                            {(isNotificationBar && !item.read) && hoveredIndex === itemId &&
                                <button className="read-btn" 
                                        title='Mark as read' 
                                        onClick={() => onRead(itemId)}>
                                </button>
                            }
                            {(isNotificationBar || isCartBar) && hoveredIndex === itemId &&
                                <button className={`btn delete-${menu}-btn`} 
                                        title={isNotificationBar ? 'Delete notification' : 'Remove item'} 
                                        onClick={() => {setDeletedIndex(itemId); onDeleteItem(itemId)}}>
                                    <DeleteIcon fontSize={'small'} />
                                </button>
                            }
                        </div> 
                    )})
                )
            } 
        </div>

        {isSearchBar &&
            <div className='see-more-search-results-section'>
                {loading ? 
                    <CircularProgress size="20px" className='circular-loader'/>
                :
                items.length === 0 ?
                    <p className='noResults'>{noResult}</p>
                :
                seeMore && items.length > 0 &&
                    <button className='btn see-more-search-btn' title='See more' onClick={onLoadMore}>
                        See more results
                    </button>
                }
            </div>
        }

        {isCart && items.length > 0 &&
            <>  
                {deletedItems > 0 &&
                    <div className='cart-deleted-products'>
                        <p>You have {deletedItems} {deletedItems > 1 ? "products" : "product"} in cart that may have been deleted by the seller.</p>
                    </div>
                }
                {!isAuthenticated &&
                    <div className='logged-out-cart'>
                        <p>You're signed out right now. To save these items or see your previously saved items,
                            <button onClick={handleSignInCart}>Sign in</button>.
                        </p>
                    </div>
                }
                <div className='cart-total-price'>
                    <p>Total</p>
                    <p>{totalPrice}</p>
                </div>
                <div className='cart-buttons-section'>
                    <Link to='/cart' className='btn cart-btns view-cart-btn'>View cart</Link>
                    {isAuthenticated &&
                        <button  className={`btn cart-btns checkout-btn ${totalPrice === "$0.00" ? "disabled-btn disabled-btn-checkout" : ""}`}
                                onClick={goToCheckoutPage}
                                disabled={totalPrice === "$0.00"}
                        >
                            Checkout
                        </button>
                    }
                </div>
            </>
        }
      </div>
    )
}

export default HoverMenu;