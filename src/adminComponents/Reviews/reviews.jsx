import { useEffect, useState } from "react";
import DataShowing from "../DataShowing/dataShowing";
import Pagination from "../Pagination/pagination";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getAllReviews } from "../../redux/features/adminSlice";
import { CircularProgress } from "@mui/material";


const Reviews = ({tab}) => {

    const [ searchParams, setSearchParams ] = useSearchParams();
    const deleting = searchParams.get("deleting");

    const dispatch = useDispatch();
    const { items, reviewsFetched, page, totalPages, isFetchingChecked } = useSelector((state) => state.admin.reviews);

    const [currentPage, setCurrentPage] = useState(page);

    useEffect(() => {
        if ((items.length === 0 && !reviewsFetched) || (currentPage !== page)){
            dispatch(getAllReviews({page: currentPage}));
        }
    }, [items, reviewsFetched, currentPage])

     useEffect(() => {
        if (tab !== "reviews") return;
        if (deleting === "true"){
            if (currentPage > 1 && items.length === 1){
                setCurrentPage(prev => prev - 1);
            }
            else{
                dispatch(getAllReviews({page: currentPage}));
            }
            searchParams.delete("deleting");
            setSearchParams(searchParams);
        }
    }, [tab, deleting])

    if (!isFetchingChecked) {
        return (
          <div style={{textAlign: "center", marginTop: "50px", marginBottom: "50px"}}>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    if (items.length === 0){
        return (
            <div style={{textAlign: "center"}}>
                <h3>No reviews found.</h3>
            </div>
        )
    }

    return (
      <>
        <DataShowing usage="reviews" items={items} />
        {totalPages > 1 &&
            <Pagination totalPages={totalPages} 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
            />
        }
      </>
    )
}

export default Reviews;