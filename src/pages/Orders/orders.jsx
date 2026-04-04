import { CircularProgress } from "@mui/material";
import "./orders.css";
import Footer from "../../components/Footer/footer";
import Navbar from "../../components/Navbar/navbar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBuyerOrders, resetMessages, resetOrders, deleteOrder } from "../../redux/features/ordersSlice";
import OrderItems from "../../components/OrderItems/orderItems";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { closeGeneralPopUp, openGeneralPopUp } from "../../redux/features/uiSlice";
import Filter from "../../components/Filter/filter";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";
import { capitalizeFirstLetter } from "../../utils/helper";

const Orders = () => {

    const dispatch = useDispatch();
    const {userInfo} = useSelector((state) => state.user);
    const {generalPopUp} = useSelector((state) => state.ui);
    const {orders, totalOrders, loading, isFetchingChecked, error, successMessage, hasMore, nextSkip} = useSelector((state) => state.order);
    const [loadMoreClicked, setLoadMoreClicked] = useState(false);
    const [deleteOrderId, setDeleteOrderId] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [ordersDeleted, setOrdersDeleted] = useState(0);

    const [selectedStatus, setSelectedStatus] = useState("All");

    const orderStatus = [
        { _id: 1, name: "pending" },
        { _id: 2, name: "cancelled" },
        { _id: 3, name: "failed" },
        { _id: 4, name: "expired" },
        { _id: 5, name: "paid" },
        { _id: 6, name: "delivered"},
    ];

    const handleFilter = (filterType, value, id) => {
        if (filterType !== "status") return;
        setSelectedStatus(capitalizeFirstLetter(value));
    
        let payload = {
            buyerId: userInfo._id,
            skip: 0,
        };

        if (value !== "All" && value !== "all"){
            payload.status = value;
        }

        dispatch(resetOrders());
        dispatch(getBuyerOrders(payload));
    }

    useEffect(() => {
        dispatch(resetOrders());
        if (userInfo?._id && !userInfo.isAdmin){
            dispatch(getBuyerOrders({buyerId: userInfo._id, skip: 0}));
        }
    }, [userInfo])

    const handleLoadMore = () => {
        const query = {
            buyerId: userInfo._id,
            skip: ordersDeleted > 0 ? nextSkip - ordersDeleted : nextSkip,
            append: true
        }
        if (selectedStatus !== "All"){
            query.status = selectedStatus.toLowerCase();
        }
        dispatch(getBuyerOrders(query));
        setOrdersDeleted(0);
    }

    const handleDeleteOrder = async (orderId) => {
        setDeleteOrderId(orderId);
        dispatch(openGeneralPopUp("YesNo"));
    }

    const handleCancelDelete = () => {
        dispatch(closeGeneralPopUp());
        setDeleteOrderId(null);
    }
    
    const removeOrder = async () => {
        if (loadingDelete) return;
        setLoadingDelete(true);
        try{
            await dispatch(deleteOrder({orderId: deleteOrderId})).unwrap();
            handleCancelDelete();
            setOrdersDeleted(prev => prev + 1);

            if (orders.length === 1 && totalOrders > 0){
                dispatch(resetOrders());
                dispatch(getBuyerOrders({buyerId: userInfo._id, skip: 0}));
                setOrdersDeleted(0);
            }
        }
        catch (err){
            console.error(err);
        }
        finally{
            setLoadingDelete(false);
        }
    } 

    useEffect(() => {
        if (orders?.length === 0) {
          setLoadMoreClicked(false);
        }
    }, [orders?.length]);

    useEffect(() => {
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
        dispatch(resetMessages());
    }, [error, successMessage])

    const [showFilter, setShowFilter] = useState(false);
    useEffect(() => {
        if (orders?.length === 0 && selectedStatus === "All"){
            setShowFilter(false);
        }
        else{
            setShowFilter(true);
        }
    }, [orders, selectedStatus])

    if (userInfo.isAdmin){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>This page is only available for other users, not for the admin!</p>
            </div>
        )
    }

    return (
      <div className="orders-page">
        <div className="orders-page-wrapper">
            <PageTitle title="Orders | RB Market" />
            <PayMethodAction from={"/checkout?"} />
            <Navbar />

            <div className="orders-page-container">
                <div className="order-header-filter">
                    <h1>My orders ({totalOrders})</h1>
                    {showFilter &&
                        <Filter label="Filter by status"
                            filterType="status"
                            usage={"orders"} 
                            items={orderStatus}
                            selectedItem={selectedStatus}
                            onSelection={handleFilter}
                        />
                    }
                </div>
                
                {loading && !isFetchingChecked && !loadMoreClicked ? 
                <div className='orders-loading-screen'>
                    <CircularProgress size={40} thickness={5} />
                </div>
                :
                (orders?.length > 0 ? 
                    <>
                        <div className="orders-page-wrapper">
                            <OrderItems items={orders} loading={loading} handleDeleteOrder={handleDeleteOrder}/>
                            {hasMore && (
                                <div className="load-more-container">
                                <button
                                    className={`load-more-btn ${loading ? 'disabled-btn disable-btn' : ""}`}
                                    onClick={() => {
                                    setLoadMoreClicked(true);
                                    handleLoadMore();
                                    }}
                                    disabled={loading}
                                >
                                    {loading && loadMoreClicked ? 
                                    <span>
                                        <CircularProgress size={15} style={{marginTop: "3px"}}/>
                                    </span>
                                    :
                                    "Show More"
                                    }
                                </button>
                                </div>
                            )}

                            {generalPopUp === "YesNo" &&
                                <GeneralPopUp usage="YesNo"
                                            showLastBtns={false} 
                                            closePopUp={handleCancelDelete}
                                            content={() => (
                                            <div className='popup-asking-delete'>
                                                <h3>Delete order</h3>
                                                <p>Are you sure you want to delete this order?</p>
                                                <div className='YesNoBtns'>
                                                    <button disabled={loadingDelete} className={loadingDelete ? "disabled-btn" : ""} onClick={handleCancelDelete}>No</button>
                                                    <button disabled={loadingDelete} className={loadingDelete ? "disabled-btn" : ""} onClick={removeOrder}>Yes</button>
                                                </div>
                                            </div>
                                            )}
                                />
                            }
                        </div>
                    </>
                    :
                    <div className="no-orders">
                        <h3>You don't have any orders yet.</h3>
                    </div>)
                }  
            </div>
        </div>

        {!loading &&
            <Footer />
        }
      </div>
    )
}

export default Orders;