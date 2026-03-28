import { useSearchParams } from "react-router-dom";
import DataShowing from "../DataShowing/dataShowing";
import Pagination from "../Pagination/pagination";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBuyerOrders } from "../../redux/features/ordersSlice";
import { CircularProgress } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils/helper";

const Orders = ({tab}) => {
    
    const [searchParams, setSearchParams] = useSearchParams();
    const deleting = searchParams.get("deleting");

    const dispatch = useDispatch();
    const {userInfo} = useSelector((state) => state.user);
    const {orders, isFetchingChecked, page, totalPages} = useSelector((state) => state.order);
    const [currentPage, setCurrentPage] = useState(page);

    const orderStatus = [
        { _id: 1, name: "pending" },
        { _id: 2, name: "cancelled" },
        { _id: 3, name: "failed" },
        { _id: 4, name: "expired" },
        { _id: 5, name: "paid" },
        { _id: 6, name: "delivered"},
    ];
    const [selectedStatus, setSelectedStatus] = useState("All");

    useEffect(() => {
        if (currentPage !== page){
            let payload = {
                buyerId: userInfo._id,
                page: currentPage,
            };
            if (selectedStatus !== "All" && selectedStatus !== "all"){
                payload.status = selectedStatus.toLowerCase();
            }
            dispatch(getBuyerOrders(payload));
        }
    }, [currentPage])

    const fetchOrders = () => {
        dispatch(getBuyerOrders({buyerId: userInfo._id, page: currentPage}));
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleFilter = (filterType, name, id) => {
        if (filterType !== "status") return;
        setSelectedStatus(capitalizeFirstLetter(name));

        let payload = {buyerId: userInfo._id};

        if (currentPage === 1){
            payload.page = 1;
        }
        else{
            setCurrentPage(1);
            return;
        }

        if (name !== "All" && name !== "all"){
            payload.status = name;
        }

        dispatch(getBuyerOrders(payload));
    }

    const handleClearFilter = () => {
        setSelectedStatus("All");
        if (currentPage > 1){
            setCurrentPage(1);
        }
        else{
            fetchOrders();
        }
    }

    useEffect(() => {
        if (tab !== "orders") return;
        if (deleting === "true"){
            if (currentPage > 1 && orders.length === 1){
                setCurrentPage(prev => prev - 1);
                return;
            }
            else{
                let payload = {buyerId: userInfo._id, page: currentPage};
                if (selectedStatus !== "All" && selectedStatus !== "all"){
                    payload.status = selectedStatus.toLowerCase();
                }
                dispatch(getBuyerOrders(payload));
            }
            searchParams.delete("deleting");
            setSearchParams(searchParams);
        }
    }, [tab, deleting]);

    if (!isFetchingChecked) {
        return (
          <div style={{textAlign: "center", marginTop: "50px", marginBottom: "50px"}}>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    return (
      <>
        <DataShowing usage="orders" 
                    items={orders} 
                    statusItems={orderStatus}
                    selectedStatus={selectedStatus}
                    onSelection={handleFilter}
                    handleClearFilter={handleClearFilter}            
        />
        {totalPages > 1 &&
            <Pagination totalPages={totalPages} 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
            />
        }
      </>
    )
}

export default Orders;