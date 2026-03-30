import "./dataShowing.css";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import defaultProfilePic from "../../../public/assets/defaultPerson.jpg";
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PasswordIcon from '@mui/icons-material/Password';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HoverMenu from "../../components/HoverMenu/hoverMenu";
import { capitalizeFirstLetter, performAccountDeletion, timeAgo } from "../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { openGeneralPopUp, closeGeneralPopUp } from "../../redux/features/uiSlice";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { requestPasswordReset } from "../../redux/features/authSlice";
import { deleteAccount, resetMessages as resetUserMessages } from "../../redux/features/userSlice";
import { toast } from "react-toastify";
import { deleteProduct, resetMessages as resetProductMessages } from "../../redux/features/productSlice";
import { resetMessages as resetReviewMessages } from "../../redux/features/reviewSlice";
import { deleteReview } from "../../redux/features/reviewSlice";
import deleteFile from "../../firebase/deleteFile";
import { deleteOrder, resetMessages as resetOrderMessages } from "../../redux/features/ordersSlice";
import SearchBar from "../../components/SearchBar/searchBar";
import Filter from "../../components/Filter/filter";
import axiosInstance from "../../redux/api/axios";
import { deleteTransaction, updateUserStatus } from "../../redux/features/adminSlice";


const DataShowing = ({usage, items, searchValue, setSearchValue, handleClearSearch, handleClearFilter, statusItems, selectedStatus, onSelection}) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {generalPopUp} = useSelector((state) => state.ui);
    const {userInfo, loading: statusLoading} = useSelector((state) => state.user);
    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: userLoading, error: userError, successMessage: userSuccessMessage } = useSelector((state) => state.user);
    const { loading: productLoading, error: productError, successMessage: productSuccessMessage } = useSelector((state) => state.product.shopping);
    const { loading: reviewLoading, error: reviewError, successMessage: reviewSuccessMessage } = useSelector((state) => state.review);
    const { error: orderError, successMessage: orderSuccessMessage } = useSelector((state) => state.order);
    const { error: transactionError, successMessage: transactionSuccessMessage } = useSelector((state) => state.admin.transactions);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [updateItemId, setUpdateItemId] = useState(null);
    const [imageFilePath, setImgFilePath] = useState(null);
    const [userSlug, setUserSlug] = useState(null);
    const [loading, setLoading] = useState(false);

    const [searchFilter, setSearchFilter] = useState(false);
    const [isFilterOpen, setFilter] = useState(false);

    useEffect(() => {
        if (selectedStatus !== "All"){
            setFilter(true);
        }
    }, [selectedStatus])

    useEffect(() => {
        if (searchValue){
            setSearchFilter(true);
        }
    }, [searchValue])

    useEffect(() => {
        return () => {
          setFilter(false);
          setSearchFilter(false);
        };
    }, []);

    const [activeSettingBtn, setActiveSettingBtn] = useState({
        _id: null,
        itemSlug: null,
        email: null,
        imageFilePath: null,
        accountStatus: null,
    });
    const settingMenuRef = useRef(null);

    const [accountStatus, setAccountStatus] = useState(null);
    const [statusReason, setStatusReason] = useState("");

    const isUsers = usage === "users";
    const isProducts = usage === "products";
    const isReviews = usage === "reviews";
    const isOrders = usage === "orders";
    const isTransactions = usage === "transactions";

    const settingItems = [
        ...(!isReviews && !isOrders && !isTransactions ? [{
            _id: 1,
            text: "Edit",
            icon: <EditIcon />
        }] : []),
        ...(isUsers ? [
            {
                _id: 2,
                text: "Password",
                icon: <PasswordIcon />
            },
            {
                _id: 3,
                text: "Status",
                icon: <PauseCircleOutlineIcon />
            },
        ] : []),
        {
            _id: 4,
            text: "Delete",
            icon: <DeleteIcon />
        }
    ]

    useEffect(() => {
      if (!activeSettingBtn._id) return;

      const handleClickOutside = (e) => {
        if (settingMenuRef.current && !settingMenuRef.current.contains(e.target)) {
          setActiveSettingBtn(prev => ({...prev, _id: null}));
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeSettingBtn._id]);

    useEffect(() => {
        if (isUsers) {
            dispatch(resetUserMessages());
            if (userError) toast.error(userError);
            if (userSuccessMessage) toast.success(userSuccessMessage);
        }
        if (isProducts){
            dispatch(resetProductMessages());
            if (productError) toast.error(productError);
            if (productSuccessMessage) toast.success(productSuccessMessage);
        }
        if (isReviews){
            if (reviewError) toast.error(reviewError);
            if (reviewSuccessMessage) toast.success(reviewSuccessMessage);
            dispatch(resetReviewMessages());
        }
        if (isOrders){
            if (orderError) toast.error(orderError);
            if (orderSuccessMessage) toast.success(orderSuccessMessage);
            dispatch(resetOrderMessages());
        }
        if (isTransactions){
            if (transactionError) toast.error(transactionError);
            if (transactionSuccessMessage) toast.success(transactionSuccessMessage);
            dispatch(resetOrderMessages());
        }
    }, [isUsers, userError, userSuccessMessage, isProducts, productError, productSuccessMessage, 
        isReviews, reviewError, reviewSuccessMessage, isOrders, orderError, orderSuccessMessage,
        isTransactions, transactionError, transactionSuccessMessage, dispatch])

    const handleSettingClick = (id) => {
        if (isUsers){
            if (id === 1){
                navigate(`/updateuser?userSlug=${activeSettingBtn.itemSlug}`);
                setActiveSettingBtn({_id: null, itemSlug: null, imageFilePath: null, email: null, accountStatus: null});
            }
            else if (id === 2){
                dispatch(openGeneralPopUp("setPassword"));
                setActiveSettingBtn(prev => ({...prev, _id: null, itemSlug: null, imageFilePath: null, accountStatus: null}));
            }
            else if (id === 3){
                dispatch(openGeneralPopUp("setStatus"));
                setUpdateItemId(activeSettingBtn._id);
                setAccountStatus(activeSettingBtn.accountStatus);
                setActiveSettingBtn({_id: null, itemSlug: null, imageFilePath: null, email: null, accountStatus: null});
            }
            else if (id === 4){
                dispatch(openGeneralPopUp("YesNo"));
                setDeleteItemId(activeSettingBtn._id);
                setUserSlug(activeSettingBtn.itemSlug);
                setImgFilePath(activeSettingBtn.imageFilePath);
                setActiveSettingBtn({_id: null, itemSlug: null, imageFilePath: null, email: null, accountStatus: null});
            }
        }
        else if (isProducts){
            if (id === 1){
                navigate(`/list-item?product=${activeSettingBtn.itemSlug}&admin=true`);
                setActiveSettingBtn(prev => ({...prev, _id: null, itemSlug: null}));
            }
            else if (id === 4){
                dispatch(openGeneralPopUp("YesNo"));
                setDeleteItemId(activeSettingBtn._id);
                setImgFilePath(activeSettingBtn.imageFilePath);
                setActiveSettingBtn(prev => ({...prev, _id: null, imageFilePath: null}));
            }
        }
        else if (isReviews || isOrders || isTransactions){
            if (id === 4){
                dispatch(openGeneralPopUp("YesNo"));
                setDeleteItemId(activeSettingBtn._id);
                setActiveSettingBtn(prev => ({...prev, _id: null}));
            }
        }
    }

    // user functions
    const handleSetStatus = async () => {
        if (!isUsers) return;
        if (userInfo._id === updateItemId){
            toast.error("Admin can not change his status!");
            return;
        }

        if (["frozen", "banned"].includes(accountStatus) && !statusReason) {
            toast.warn("You need to specify a reason for the status that you choose.");
            return;
        }

        try{
            const res = await axiosInstance.patch(`/user/admin/setStatus/${updateItemId}`, {accountStatus, statusReason});
            toast.success(res.data.message);
            dispatch(updateUserStatus({_id: updateItemId, status: accountStatus}));
            setUpdateItemId(null);
            setAccountStatus(null);
            setStatusReason("");
            dispatch(closeGeneralPopUp());
        }
        catch(err){
            toast.error(err.response?.data?.message);
        }
    }

    const handleResetPasswordLink = async () => {
        if (!isUsers) return;
        try{
            await dispatch(requestPasswordReset({email: activeSettingBtn.email})).unwrap();
            dispatch(closeGeneralPopUp());
            setActiveSettingBtn(prev => ({...prev, email: null}));
        }
        catch(err){
            console.error(err);
        }
    }

    const handleDeleteUser = async () => {
        if (!isUsers) return;
        if (userInfo.isAdmin){
            toast.error("Admin can not delete his own account.");
            return;
        }
        try{
            setLoading(true);
            await performAccountDeletion(userSlug, imageFilePath);
            await dispatch(deleteAccount({userId: deleteItemId})).unwrap();
            dispatch(closeGeneralPopUp());
            setDeleteItemId(null);
            setLoading(false);
            navigate("/admin?tab=users&deleting=true");
        }
        catch(err){
            console.error(err);
            setLoading(false);
        }
    }

    // product functions
    const handleDeleteProduct = async () => {
        if (!isProducts) return;
        try{
            setLoading(true);
            if (imageFilePath){
                await deleteFile(imageFilePath);
            }
            await dispatch(deleteProduct({productId: deleteItemId, isAdmin: true})).unwrap();
            dispatch(closeGeneralPopUp());
            setDeleteItemId(null);
            setImgFilePath(null);
            setLoading(false);
            navigate("/admin?tab=products&deleting=true");
        }
        catch(err){
            console.error(err);
            setLoading(false);
        }
    }

    // review functions
    const handleDeleteReview = async () => {
        if (!isReviews) return;
        try{
            await dispatch(deleteReview({reviewId: deleteItemId})).unwrap();
            dispatch(closeGeneralPopUp());
            setDeleteItemId(null);
            navigate("/admin?tab=reviews&deleting=true");
        }
        catch(err){
            console.error(err);
        }
    };

    // order functions
    const handleDeleteOrder = async () => {
        if (!isOrders) return;
        try{
            await dispatch(deleteOrder({orderId: deleteItemId, isAdmin: true})).unwrap();
            dispatch(closeGeneralPopUp());
            setDeleteItemId(null);
            navigate("/admin?tab=orders&deleting=true");
        }
        catch(err){
            console.error(err);
        }
    };

    // transactions functions
    const handleDeleteTransaction = async () => {
        if (!isTransactions) return;
        try{
            await dispatch(deleteTransaction({transactionId: deleteItemId})).unwrap();
            dispatch(closeGeneralPopUp());
            setDeleteItemId(null);
            navigate("/admin?tab=transactions&deleting=true");
        }
        catch(err){
            console.error(err);
        }
    };

    return (
      <>
        <div className="dataShowing-headers">
            {(isOrders || isTransactions) && 
                <h3 className="order-header admin-headers">
                    {isOrders ? "ORDER" : "TRANSACTION"}
                </h3>
            }
            {!isReviews && !isOrders && !isTransactions && <h3 className="image-header admin-headers">IMAGE</h3>}
            {(isUsers || isProducts) && 
                <div className={`name-header admin-headers filtering ${searchFilter ? "filter-header" : ""}`} style={{marginRight: "10px"}}>
                    {searchFilter ? 
                    <SearchBar usage="admin"
                        value={searchValue} 
                        onChange={(e) => setSearchValue(e.target.value)} 
                        onClear={handleClearSearch} 
                        placeholder={isUsers ? `Search user` : `Search product`}
                    />
                    :
                    <h3>
                        {isUsers ? "NAME" : 
                        isProducts && "TITLE"
                        }
                    </h3>
                    }
                    {searchFilter ? 
                        <button title="Close filtering" className="btn filter-admin-btn" onClick={() => {setSearchFilter(false); handleClearSearch()}}>
                            <CloseIcon />
                        </button>
                        :
                        <button title="Filter by name" className="btn filter-admin-btn" onClick={() => setSearchFilter(true)}>
                            <FilterAltIcon />
                        </button>
                    }
                </div>
            }
            {(isReviews || isOrders || isTransactions) && 
                <h3 className="name-header admin-headers" style={{marginRight: "10px"}}>
                    {isReviews ? "REVIEW" :
                        isOrders ? "BUYER" :
                        isTransactions && "USER"
                    }
                </h3>
            }
            {isUsers && (!searchFilter && <h3 className="email-header admin-headers">EMAIL</h3>)}
            {isProducts && 
                <>
                    {!searchFilter && <h3 className="price-header admin-headers" style={{marginLeft: "-20px", marginRight: "10px"}}>PRICE</h3>}
                    <h3 className="price-header admin-headers stock-header-admin" style={{marginRight: "10px"}}>STOCK</h3>
                </>
            }
            {(isOrders || isTransactions) && 
                <>
                    <h3 className="price-header admin-headers stock-header-admin" style={{marginLeft: "-20px", marginRight: "10px"}}>
                        {isOrders ? "ITEMS" : "ITEM"}
                    </h3>
                    <h3 className="price-header admin-headers stock-header-admin" style={{marginRight: "10px"}}>
                        {isOrders ? "TOTAL" : "AMOUNT"}
                    </h3>
                </>
            }
            {isOrders && <h3 className="price-header admin-headers" style={{marginRight: "10px"}}>TYPE</h3>}
            {isProducts && <h3 className="name-header admin-headers from-seller-header">SELLER</h3>}
            {(isUsers || isOrders || isTransactions) &&
            <div className={`name-header admin-headers from-seller-header filtering ${isTransactions ? "transaction-header" : ""}`} style={{marginRight: "10px"}}>
                    {isFilterOpen ? 
                    <div className="filter-admin">
                        <Filter filterType="status"
                            usage={"admin"} 
                            items={statusItems}
                            selectedItem={selectedStatus}
                            onSelection={onSelection}
                        />
                    </div>
                    :
                    <h3>
                        {isTransactions ? "TYPE" : "STATUS"}
                    </h3>
                    }
                    {isFilterOpen ? 
                        <button title="Close filtering" className="btn filter-admin-btn" onClick={() => {setFilter(false); handleClearFilter()}}>
                            <CloseIcon />
                        </button>
                        :
                        <button title="Filter by status" className="btn filter-admin-btn" onClick={() => setFilter(true)}>
                            <FilterAltIcon />
                        </button>
                    }
                </div>
            }
            {isTransactions && <h3 className="price-header admin-headers" style={{marginRight: "10px"}}>PROVIDER</h3>}
            {isReviews && 
                <>
                    <h3 className="name-header admin-headers">PRODUCT</h3>
                    <h3 className="name-header admin-headers from-seller-header">FROM</h3>
                </>
            }
            <h3 className="joined-header admin-headers">
                {isUsers && "JOINED"}
                {isProducts && "LISTED"}
                {isReviews && "WHEN"}
                {isOrders && "ORDERED"}
                {isTransactions && "TIME"}
            </h3>
            <h3 className="settings-data-header admin-headers">
                <SettingsIcon style={{marginTop: "-2px"}}/>
            </h3>
        </div>

        <hr className="dataShowing-hr"/>

        {items?.length === 0 ? 
            <div style={{textAlign: "center"}}>
                <h3>No results found.</h3>
            </div>
            :
            items?.map(item => (
                <div key={item._id}>
                    <div className="dataShowing-results">
                        {isOrders && 
                            <div className="order-id-result">
                                <Link to={`/order/${item._id}`}>
                                    View order
                                </Link>
                            </div>
                        }
                        {isTransactions && 
                            <div className="order-id-result">
                                <Link to={`/transaction/${item._id}`}>
                                    View transaction
                                </Link>
                            </div>
                        }
                        {(isUsers || isProducts) &&
                            <div className="image-result">
                                <Link to={isUsers ? `/profile/${item.slug}` : 
                                        isProducts && `/item/${item.slug}`
                                        }
                                >
                                    {isUsers && <img src={item.avatar || defaultProfilePic} alt="Profile picture" onError={(e) => {e.currentTarget.src = defaultProfilePic}} />}
                                    {isProducts && <img src={item.image || defaultProductPicture} alt="Product image" onError={(e) => {e.currentTarget.src = defaultProductPicture}} />}
                                </Link>
                            </div>
                        }
                        {isReviews &&
                            <>
                                <div className="review-result">
                                    {item.vote === "Positive" ? 
                                        <span className="positive-vote-review">
                                          <ThumbUpIcon fontSize="small"  style={{marginTop: "3px"}}/> 
                                        </span>
                                        :
                                        <span className="negative-vote-review">
                                          <ThumbDownIcon fontSize="small" style={{marginTop: "3px"}}/> 
                                        </span>
                                    }
                                    <p>{item.comment} {item.createdAt !== item.updatedAt && <span className="edited-span">(Edited {timeAgo(item.updatedAt)})</span>}</p>
                                </div>
                                <div className="name-result">
                                    <Link to={`/item/${item.product.slug}`}>
                                        {item.product.title}
                                    </Link>
                                </div>
                            </>
                        }
                        <div className={`name-result ${isReviews ? "from-seller-header" : ""}`}>
                            <Link to={isUsers ? `/profile/${item.slug}` : 
                                    isProducts ? `/item/${item.slug}` :
                                    (isReviews && item.user) ? `/profile/${item.user.slug}` :
                                    (isOrders && item.buyer) ? `/profile/${item.buyer.slug}` :
                                    (isTransactions && item.user) && `/profile/${item.user.slug}`
                                }
                            >
                                {isUsers && item.firstName + " " + item.lastName}
                                {isProducts && item.title}
                                {isReviews && (item.user ? item.user.firstName + " " + item.user.lastName : "Deleted User")}
                                {isOrders && (item.buyer ? item.buyer.firstName + " " + item.buyer.lastName : "Deleted User")}
                                {isTransactions && (item.user ? item.user.firstName + " " + item.user.lastName : "Deleted User")}
                            </Link>
                        </div>
                        {isUsers &&
                            <div className={`email-result ${item.isEmailVerified ? "verified-email" : "not-verified-email"}`}>
                                <p>
                                    {isUsers && item.email}
                                </p>
                            </div>
                        }
                        {isProducts && 
                            <>
                                <div className="price-result">
                                    ${(item.price / 100).toFixed(2)}
                                </div>
                                <div className="price-result stock-header-admin stock-available">
                                    ${item.stock} available
                                </div>
                            </>
                        }
                        {(isOrders || isTransactions) && 
                            <>
                                <div className="price-result stock-header-admin">
                                    {isOrders && item.items.length}
                                    {isTransactions &&
                                        <Link className="transaction-product-link" to={item.relatedProduct && `/item/${item.relatedProduct.slug}`}>
                                            {item.relatedProduct ? item.relatedProduct.title : "Deleted"}
                                        </Link>
                                    } 
                                </div>
                                <div className="price-result stock-header-admin">
                                    {isOrders && `$${(item.totalAmount / 100).toFixed(2)}`}
                                    {isTransactions && `$${(item.amount / 100).toFixed(2)}`}
                                </div>
                            </>
                        }
                        {isProducts &&
                            <div className="name-result from-seller-header">
                                <Link to={`/profile/${item.seller.slug}`}>
                                    {item.seller.firstName + " " + item.seller.lastName}
                                </Link>
                            </div>
                        }
                        {(isOrders || isTransactions) &&
                            <div className={"price-result order-type"}>
                                {capitalizeFirstLetter(item.type)}
                            </div>
                        }
                        {isOrders &&
                            <div className="name-result from-seller-header">
                                <span className={`${item.status}-status`}>
                                    {capitalizeFirstLetter(item.status)}
                                </span>
                            </div>
                        }
                        {isTransactions &&
                            <div className="price-result order-type">
                                <span>
                                    {capitalizeFirstLetter(item.provider)}
                                </span>
                            </div>
                        }
                        {isUsers &&
                            <div className="name-result from-seller-header">
                                <span className={`${item.accountStatus}-status`}>
                                    {capitalizeFirstLetter(item.accountStatus)}
                                </span>
                            </div>
                        }
                        <div className="joined-result">{timeAgo(item.createdAt)}</div>
                        <div className="edit-data-result" ref={activeSettingBtn._id === item._id ? settingMenuRef : null}>
                            <button className="btn edit-data-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSettingBtn(prev => ({...prev, _id: activeSettingBtn._id === item._id ? null : item._id}));
                                        ((isUsers || isProducts) && item.slug) && setActiveSettingBtn(prev => ({...prev, itemSlug: item.slug}));
                                        (isUsers && item.email) && setActiveSettingBtn(prev => ({...prev, email: item.email}));
                                        (isProducts && item.imageFilePath) && setActiveSettingBtn(prev => ({...prev, imageFilePath: item.imageFilePath}));
                                        (isUsers && item?.avatarFilePath) && setActiveSettingBtn(prev => ({...prev, imageFilePath: item.avatarFilePath}));
                                        (isUsers && item?.accountStatus) && setActiveSettingBtn(prev => ({...prev, accountStatus: item.accountStatus}));
                                    }}
                            >
                                <MoreVertIcon style={{marginTop: "3px"}}/>
                            </button>

                            {activeSettingBtn._id === item._id && 
                                <HoverMenu menu="reviewSettings" 
                                          items={settingItems} 
                                          onClickItem={handleSettingClick}
                                />
                            }
                        </div>
                    </div>
                    <hr className="dataDividing-hr"/>
                </div>
            ))
        }
        
        

        {generalPopUp === "setStatus" &&
            <GeneralPopUp usage="setStatus"
                  showLastBtns={true}
                  cancelBtnText="Cancel"
                  saveBtnText="Save changes"
                  onCancel={() => dispatch(closeGeneralPopUp())}
                  onSave={handleSetStatus}
                  disabledSaveBtn={accountStatus === null}
                  loading={statusLoading} 
                  content={() => (
                    <div className="setstatus-container">
                        <div className="status-choices">
                            <label htmlFor="active">
                                <input type="radio" 
                                    name="status"
                                    value="active" 
                                    id="active"
                                    checked={accountStatus === "active"}
                                    onChange={(e) => setAccountStatus(e.target.value)}
                                />
                                Active
                            </label>
                            <label htmlFor="frozen">
                                <input type="radio" 
                                    name="status"
                                    value="frozen" 
                                    id="frozen"
                                    checked={accountStatus === "frozen"}
                                    onChange={(e) => setAccountStatus(e.target.value)}
                                />
                                Frozen
                            </label>
                            <label htmlFor="banned">
                                <input type="radio" 
                                    name="status"
                                    value="banned" 
                                    id="banned"
                                    checked={accountStatus === "banned"}
                                    onChange={(e) => setAccountStatus(e.target.value)}
                                />
                                Banned
                            </label>
                        </div>
                        <div className="status-reason">
                            <textarea placeholder="Write the reason of your choice above ..."
                                      value={statusReason}
                                      onChange={(e) => setStatusReason(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                  )}
            />  
        }

        {generalPopUp === "setPassword" &&
            <GeneralPopUp usage="setPassword"
                  showLastBtns={true}
                  cancelBtnText="Cancel"
                  saveBtnText="Send email"
                  onCancel={() => dispatch(closeGeneralPopUp())}
                  onSave={handleResetPasswordLink}
                  loading={authLoading} 
                  content={() => (
                    <p style={{marginBottom: "30px"}}>Send a reset password link to the email of this user.</p>
                  )}
            />  
        }

        {generalPopUp === "YesNo" &&
            <GeneralPopUp usage="YesNo"
                showLastBtns={false} 
                closePopUp={() => {dispatch(closeGeneralPopUp(), setActiveSettingBtn(prev => ({...prev, _id: null})))}}
                content={() => (
                  <div className='popup-asking-delete'>
                    <h3>
                        {isUsers && "Delete user"}
                        {isProducts && "Delete product"}
                        {isReviews && "Delete review"}
                        {isOrders && "Delete order"}
                        {isTransactions && "Delete transaction"}
                    </h3>
                    <p>
                        {isUsers && "Are you sure you want to delete this user?"}
                        {isProducts && "Are you sure you want to delete this product?"}
                        {isReviews && "Are you sure you want to delete this review?"}
                        {isOrders && "Are you sure you want to delete this order?"}
                        {isTransactions && "Are you sure you want to delete this transaction?"}
                    </p>
                    <div className='YesNoBtns'>
                        <button disabled={userLoading || productLoading || reviewLoading || loading} 
                                className={userLoading || productLoading || reviewLoading || loading ? "disabled-btn" : ""} 
                                onClick={() => {dispatch(closeGeneralPopUp(), setActiveSettingBtn(prev => ({...prev, _id: null})))}}>
                            No
                        </button>
                        <button disabled={userLoading || productLoading || reviewLoading || loading} 
                                className={userLoading || productLoading || reviewLoading || loading ? "disabled-btn" : ""} 
                                onClick={isUsers ? handleDeleteUser : 
                                        isProducts ? handleDeleteProduct :
                                        isReviews ? handleDeleteReview :
                                        isOrders ? handleDeleteOrder :
                                        isTransactions && handleDeleteTransaction}>
                            Yes
                        </button>
                    </div>
                  </div>
                )}
            />
        }
      </>
    )
}

export default DataShowing;