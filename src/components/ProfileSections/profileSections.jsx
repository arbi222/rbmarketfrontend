import { useEffect, useRef, useState } from "react";
import "./profileSections.css";
import ProductList from "../ProductList/productList";
import { CircularProgress } from '@mui/material';
import SearchBar from "../SearchBar/searchBar";
import About from "../About/about";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, resetStore } from "../../redux/features/productSlice";
import useDebounce from "../../utils/helper";
import FeedbackProfile from "../Feedback/FeedbackProfile/feedbackProfile";
import { getSellerReviews, resetReviews } from "../../redux/features/reviewSlice";
import { useSearchParams } from "react-router-dom";
import FilterUsage from "../FilterUsage/FilterUsage";

const ProfileSections = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");

    const dispatch = useDispatch();
    const { otherUserInfo } = useSelector((state) => state.user);
    const { products, isFetchingChecked, page: productsPage, totalProducts } = useSelector((state) => state.product.store);
    const { page: reviewsPage} = useSelector((state) => state.review);

    const [activeTab, setActiveTab] = useState("shop");
    const [currentPage, setCurrentPage] = useState(productsPage);
    const [searchValue, setSearchValue] = useState("");
    const debouncedQuery = useDebounce(searchValue, searchValue === "" ? 0 : 400);
    // const isFirstRender = useRef(true);
    const [isFirstRender, setFirstRender] = useState(true);

    const [currentReviewPage, setCurrentReviewPage] = useState(reviewsPage);

    const [selectedFilters, setSelectedFilters] = useState({
        category: category ? category : "All",
        categoryId: categoryId ? categoryId : null,
        brand: "All",
        brandId: null,
        condition: "All",
        conditionId: null,
        price: "All",
        priceId: null,
    });

    useEffect(() => {
      if (!category) return;

      if (selectedFilters.category !== category) {
        setSearchParams(prev => {
          prev.delete("category");
          prev.delete("categoryId");
          return prev;
        });
        window.history.replaceState({}, "", `${window.location.pathname}`);
      }  
    }, [selectedFilters.category]);

    const buildFilterQuery = () => {
      const query = {sellerSlug: otherUserInfo.slug};

      if (debouncedQuery) query.title = debouncedQuery;
      if (selectedFilters.categoryId) query.category = selectedFilters.categoryId;
      if (selectedFilters.brandId) query.brand = selectedFilters.brandId;
      if (selectedFilters.conditionId) query.condition = selectedFilters.conditionId;
      if (selectedFilters.priceId) query.price = selectedFilters.priceId;

      return query;
    };

    useEffect(() => {
      if (activeTab !== "shop") return;

      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    
      const query = buildFilterQuery();
      query.page = 1;
    
      dispatch(resetStore());
      dispatch(getAllProducts(query));
    }, [debouncedQuery, activeTab]);

    useEffect(() => {
      if (activeTab !== "shop") return;
      if (isFirstRender){
        setFirstRender(false);
        return;
      }

      const query = buildFilterQuery();
      query.page = currentPage;

      dispatch(resetStore());
      dispatch(getAllProducts(query));
    }, [currentPage]);

    const handleClearSearch = () => {
      setSearchValue("");
      setCurrentPage(1);
    }

    useEffect(() => {
      if (activeTab !== "feedback") return;

      dispatch(resetReviews());
      dispatch(getSellerReviews({sellerId: otherUserInfo._id, page: currentReviewPage}));
    }, [activeTab, currentReviewPage])

    const handleTabChange = (tab) => {
      setActiveTab(tab);
      setSearchValue("");
      setCurrentPage(1);
    };  

    const [showFilters, setShowFilters] = useState(false); 
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
      if (products.length === 0 && searchValue === ""){
        setShowSearch(false);
      }
      else{
        setShowSearch(true);
      }

      if (products.length === 0 && (selectedFilters.category === "All" && selectedFilters.brand === "All" && 
                                    selectedFilters.condition === "All" && selectedFilters.price === "All")){
        setShowFilters(false);
      }
      else{
        setShowFilters(true);
      }
    }, [products, searchValue, selectedFilters])

    return (
      <div className="profile-sections-container">
        <div className="profile-sections-top">
            <div className="profile-sections-btns">
                <button className={`btn profile-section-btn ${activeTab === "shop" ? "active" : ""}`}
                        onClick={() => handleTabChange("shop")}
                >
                    <span>Shop</span>
                </button>
                
                <button className={`btn profile-section-btn ${activeTab === "about" ? "active" : ""}`}
                        onClick={() => handleTabChange("about")}
                >
                    <span>About</span>
                </button>
                <button className={`btn profile-section-btn ${activeTab === "feedback" ? "active" : ""}`}
                        onClick={() => handleTabChange("feedback")}
                >
                    <span>Feedback</span>
                </button>
            </div>
            {(activeTab === "shop" && showSearch) &&
                <SearchBar usage="profile"
                        value={searchValue} 
                        onChange={(e) => setSearchValue(e.target.value)} 
                        onClear={handleClearSearch} 
                        placeholder={`Search all ${totalProducts} ${totalProducts > 1 || totalProducts === 0 ? "items" : "item"}`}
                />
            }
        </div>
        
        {activeTab === "shop" &&
           ((!isFetchingChecked && totalProducts === 0) ? 
            <div className="profile-sections-loader">
                <CircularProgress size={30} />
            </div>
            :
            <>
              {showFilters &&
                <div className="product-filter-profile">
                  <FilterUsage usage={"profile"}
                              selectedFilters={selectedFilters} 
                              setSelectedFilters={setSelectedFilters} 
                              debouncedQuery={debouncedQuery}
                              sellerSlug={otherUserInfo.slug}
                 />
                </div>
              }
              <div className="product-listed">
                <ProductList products={products} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
              </div>
            </>
            )
        }
        {activeTab === "about" && <About /> }
        {activeTab === "feedback" && <FeedbackProfile currentPage={currentReviewPage} setCurrentPage={setCurrentReviewPage} />}
      </div>
    )
}

export default ProfileSections;