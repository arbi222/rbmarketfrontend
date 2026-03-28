import { useSearchParams } from "react-router-dom";
import DataShowing from "../DataShowing/dataShowing";
import Pagination from "../Pagination/pagination";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils/helper";
import { getAllTransactions } from "../../redux/features/adminSlice";

const Transactions = ({tab}) => {
    
    const [searchParams, setSearchParams] = useSearchParams();
    const deleting = searchParams.get("deleting");

    const dispatch = useDispatch();
    const {items, isFetchingChecked, page, totalPages} = useSelector((state) => state.admin.transactions);
    const [currentPage, setCurrentPage] = useState(page);

    const transactionStatus = [
        { _id: 1, name: "deposit" },
        { _id: 2, name: "purchase" },
        { _id: 3, name: "sale" },
        { _id: 4, name: "platform_fee" },
        { _id: 5, name: "withdraw" },
    ]; 
    const [selectedStatus, setSelectedStatus] = useState("All");

    useEffect(() => {
        if (currentPage !== page){
            let payload = {
                page: currentPage,
            };
            if (selectedStatus !== "All" && selectedStatus !== "all"){
                payload.type = selectedStatus.toLowerCase();
            }
            dispatch(getAllTransactions(payload));
        }
    }, [currentPage])

    const fetchTransactions = () => {
        dispatch(getAllTransactions({page: currentPage}));
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleFilter = (filterType, name, id) => {
        if (filterType !== "status") return;
        setSelectedStatus(capitalizeFirstLetter(name));

        let payload = {};

        if (currentPage === 1){
            payload.page = 1;
        }
        else{
            setCurrentPage(1);
            return;
        }

        if (name !== "All" && name !== "all"){
            payload.type = name;
        }

        dispatch(getAllTransactions(payload));
    }

    const handleClearFilter = () => {
        setSelectedStatus("All");
        if (currentPage > 1){
            setCurrentPage(1);
        }
        else{
            fetchTransactions();
        }
    }

    useEffect(() => {
        if (tab !== "transactions") return;
        if (deleting === "true"){
            if (currentPage > 1 && items.length === 1){
                setCurrentPage(prev => prev - 1);
                return;
            }
            else{
                let payload = {page: currentPage};
                if (selectedStatus !== "All" && selectedStatus !== "all"){
                    payload.type = selectedStatus.toLowerCase();
                }
                dispatch(getAllTransactions(payload));
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
        <DataShowing usage="transactions" 
                    items={items}
                    statusItems={transactionStatus}
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

export default Transactions;