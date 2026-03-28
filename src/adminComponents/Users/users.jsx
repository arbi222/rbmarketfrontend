import { useEffect, useState } from "react";
import DataShowing from "../DataShowing/dataShowing";
import Pagination from "../Pagination/pagination";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/features/adminSlice";
import { CircularProgress } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import useDebounce, { capitalizeFirstLetter } from "../../utils/helper";

const Users = ({tab}) => {

    const [ searchParams, setSearchParams ] = useSearchParams();
    const deleting = searchParams.get("deleting");
    const updating = searchParams.get("updating");

    const dispatch = useDispatch();
    const { items, usersFetched, page, totalPages, loading } = useSelector((state) => state.admin.users);

    const [currentPage, setCurrentPage] = useState(page);
    const [nameFilterValue, setNameFilterValue] = useState("");
    const debouncedQuery = useDebounce(nameFilterValue, nameFilterValue === "" ? 0 : 400);

    const userStatus = [
        { _id: 1, name: "active" },
        { _id: 2, name: "frozen" },
        { _id: 3, name: "banned" },
    ];
    const [selectedStatus, setSelectedStatus] = useState("All");

    useEffect(() => {
        if ((items.length === 0 && !usersFetched) || (currentPage !== page)){
            let payload = {page: currentPage};
            if (debouncedQuery){
                payload.search = debouncedQuery;
            }
            if (selectedStatus !== "All" && selectedStatus !== "all"){
                payload.accountStatus = selectedStatus.toLowerCase();
            }
            dispatch(getAllUsers(payload));
        }
    }, [items, usersFetched, currentPage])

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
    
        if (debouncedQuery){
            payload.search = debouncedQuery;
        }

        if (name !== "All" && name !== "all"){
            payload.accountStatus = name;
        }

        dispatch(getAllUsers(payload));
    }

    useEffect(() => {
        if (debouncedQuery){
            if (currentPage > 1){
                setCurrentPage(1);
                return;
            }
            let payload = {page: 1, search: debouncedQuery};
            if (selectedStatus !== "All" && selectedStatus !== "all"){
                payload.accountStatus = selectedStatus.toLowerCase();
            }
            dispatch(getAllUsers(payload));
        }
    }, [debouncedQuery])

     useEffect(() => {
        if (tab !== "users") return;
        if (deleting === "true"){
            if (currentPage > 1 && items.length === 1){
                setCurrentPage(prev => prev - 1);
            }
            else{
                let payload = {page: currentPage};
                if (selectedStatus !== "All" && selectedStatus !== "all"){
                    payload.accountStatus = selectedStatus.toLowerCase();
                }
                dispatch(getAllUsers(payload));
            }
            searchParams.delete("deleting");
            setSearchParams(searchParams);
        }
        else if (updating === "true"){
            let payload = {page: currentPage};
            if (selectedStatus !== "All" && selectedStatus !== "all"){
                payload.accountStatus = selectedStatus.toLowerCase();
            }
            dispatch(getAllUsers(payload));
            searchParams.delete("updating");
            setSearchParams(searchParams);
        }
    }, [tab, deleting, updating])

    const handleClearSearch = () => {
        setNameFilterValue("");
        setCurrentPage(1);
        let payload = {page: 1};
        if (selectedStatus !== "All" && selectedStatus !== "all"){
            payload.accountStatus = selectedStatus.toLowerCase();
        }
        dispatch(getAllUsers(payload));
    }

    const handleClearFilter = () => {
        setSelectedStatus("All");
        setCurrentPage(1);
        let payload = {page: 1};
        if (debouncedQuery){
            payload.search = debouncedQuery;
        }
        dispatch(getAllUsers(payload));
    }

    useEffect(() => {
        return () => {
          handleClearSearch();
          handleClearFilter();
        };
    }, []);

    if (items.length === 0 && loading) {
        return (
          <div style={{textAlign: "center", marginTop: "50px", marginBottom: "50px"}}>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    return (
      <>
        <DataShowing usage="users" 
                    items={items} 
                    searchValue={nameFilterValue} 
                    setSearchValue={setNameFilterValue} 
                    handleClearSearch={handleClearSearch}
                    handleClearFilter={handleClearFilter} 
                    statusItems={userStatus}
                    selectedStatus={selectedStatus}
                    onSelection={handleFilter}
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

export default Users;