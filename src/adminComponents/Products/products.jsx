import { useEffect, useState } from "react";
import DataShowing from "../DataShowing/dataShowing";
import Pagination from "../Pagination/pagination";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { getAllProducts } from "../../redux/features/productSlice";
import useDebounce from "../../utils/helper";

const Products = ({tab}) => {

    const [ searchParams, setSearchParams ] = useSearchParams();
    const deleting = searchParams.get("deleting");
    const updating = searchParams.get("updating");

    const dispatch = useDispatch();
    const { products, isFetchingChecked, productsAdminFetched, page, totalPages } = useSelector((state) => state.product.shopping);

    const [currentPage, setCurrentPage] = useState(page);
    const [productFilterValue, setProductFilterValue] = useState("");
    const debouncedQuery = useDebounce(productFilterValue, productFilterValue === "" ? 0 : 400);

    useEffect(() => {
        if (!productsAdminFetched || (currentPage !== page)){
            dispatch(getAllProducts({page: currentPage, isAdmin: true, title: debouncedQuery}));
        }
    }, [products, currentPage])

    useEffect(() => {
        if (debouncedQuery){
            if (currentPage > 1){
                setCurrentPage(1);
                return;
            }
            dispatch(getAllProducts({page: 1, isAdmin: true, title: debouncedQuery}));
        }
    }, [debouncedQuery])

    useEffect(() => {
        if (tab !== "products") return;
        if (deleting === "true"){
            if (currentPage > 1 && products.length === 1){
                setCurrentPage(prev => prev - 1);
            }
            else{
                dispatch(getAllProducts({page: currentPage, isAdmin: true}));
            }
            searchParams.delete("deleting");
            setSearchParams(searchParams);
        }
        else if (updating === "true"){
            dispatch(getAllProducts({page: currentPage, isAdmin: true}));
            searchParams.delete("updating");
            setSearchParams(searchParams);
        }
    }, [tab, deleting, updating]);

    const handleClearSearch = () => {
        setProductFilterValue("");
        setCurrentPage(1);
        dispatch(getAllProducts({page: 1, isAdmin: true}));
    }

    useEffect(() => {
        return () => {
          handleClearSearch();
        };
    }, []);

    if (!isFetchingChecked && products.length === 0) {
        return (
          <div style={{textAlign: "center", marginTop: "50px", marginBottom: "50px"}}>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }
    
    return (
      <>
        <DataShowing usage="products" 
                    items={products}
                    searchValue={productFilterValue} 
                    setSearchValue={setProductFilterValue} 
                    handleClearSearch={handleClearSearch}  
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

export default Products;