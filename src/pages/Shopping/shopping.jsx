import Navbar from "../../components/Navbar/navbar";
import ProductList from "../../components/ProductList/productList";
import Footer from "../../components/Footer/footer";
import "./shopping.css";
import { useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar/searchBar";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, resetMessages, resetShopping } from "../../redux/features/productSlice";
import useDebounce from "../../utils/helper";
import FilterUsage from "../../components/FilterUsage/FilterUsage";
import { toast } from "react-toastify";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Shopping = () => {

    const dispatch = useDispatch();
    const { products, totalProducts, nextSkip, error } = useSelector((state) => state.product.shopping);

    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const brand = searchParams.get("brand");
    const brandId = searchParams.get("brandId");
    const linkFetch = searchParams.get("linkFetch");
    const search = searchParams.get("search");

    const [searchValue, setSearchValue] = useState("");
    const debouncedQuery = useDebounce(searchValue, searchValue === "" ? 0 : 400);

    useEffect(() => {
      if (error){
        toast.error(error);
        dispatch(resetMessages());
      }
    }, [error])

    useEffect(() => {
      if (search === null) return;
      if (search !== ""){
        setSearchValue(search)
      }
    }, [search])

    const handleSearchClear = () => {
      if (searchValue === "") return;
      setSearchValue("");
      setSearchParams(prev => {
        prev.delete("search");
        return prev;
      });
      window.history.replaceState({}, "", `${window.location.pathname}`);
    }

    const [selectedFilters, setSelectedFilters] = useState({
        category: category ? category : "All",
        categoryId: categoryId ? categoryId : null,
        brand: brand ? brand : "All",
        brandId: brandId ? brandId : null,
        condition: "All",
        conditionId: null,
        price: "All",
        priceId: null,
    });

    const buildFilterQuery = () => {
      const query = {};

      if (debouncedQuery) query.title = debouncedQuery;
      if (selectedFilters.categoryId) query.category = selectedFilters.categoryId;
      if (selectedFilters.brandId) query.brand = selectedFilters.brandId;
      if (selectedFilters.conditionId) query.condition = selectedFilters.conditionId;
      if (selectedFilters.priceId) query.price = selectedFilters.priceId;

      return query;
    };

    useEffect(() => {
      const query = buildFilterQuery();
      query.skip = 0;
      dispatch(resetShopping());
      dispatch(getAllProducts(query));
    }, [debouncedQuery]);

    useEffect(() => { 
        if (linkFetch === "true"){
          const query = buildFilterQuery();
          query.skip = 0;
          dispatch(resetShopping());
          dispatch(getAllProducts(query));
        }
    }, [selectedFilters.categoryId, linkFetch])

    const handleLoadMore = () => {
      const query = buildFilterQuery();
      query.skip = nextSkip;
      query.append = true;
      dispatch(getAllProducts(query));
    }

    useEffect(() => {
      if (category && categoryId){
        setSelectedFilters({
          category: category, 
          categoryId: categoryId,
          brand: "All",
          brandId: null,
          condition: "All",
          conditionId: null,
          price: "All",
          priceId: null, 
        });
      }
      if (brand && brandId){
        setSelectedFilters({
          category: "All", 
          categoryId: null,
          brand: brand,
          brandId: brandId,
          condition: "All",
          conditionId: null,
          price: "All",
          priceId: null, 
        });
      }
    }, [category, categoryId, brand, brandId])

    useEffect(() => {
      if (!category) return;

      if (selectedFilters.category !== category) {
        setSearchParams(prev => {
          prev.delete("category");
          prev.delete("categoryId");
          prev.delete("linkFetch");
          return prev;
        });
        window.history.replaceState({}, "", `${window.location.pathname}`);
      }  
    }, [selectedFilters.category]);

    useEffect(() => {
      if (!brand) return;

      if (selectedFilters.brand !== brand){
        setSearchParams(prev => {
          prev.delete("brand");
          prev.delete("brandId");
          return prev;
        });
        window.history.replaceState({}, "", `${window.location.pathname}`);
      }
    }, [selectedFilters.brand]);

    return (
      <div className="shopping-page">
        <PageTitle title="Shopping | RB Market" />
        <PayMethodAction from={"/checkout?"} />
        <Navbar usage="home"/>

        <div className="shopping-page-container">
            <div className="shopping-page-filters">
              <FilterUsage usage={"shopping"} 
                          selectedFilters={selectedFilters} 
                          setSelectedFilters={setSelectedFilters} 
                          debouncedQuery={debouncedQuery} 
              />
            </div>
            <div className="shopping-page-results">
              <div className="shopping-page-search-bar">
                <SearchBar usage="shop"
                        value={searchValue} 
                        onChange={(e) => setSearchValue(e.target.value)} 
                        onClear={handleSearchClear} 
                        placeholder={`Search all ${totalProducts} ${totalProducts > 1 || totalProducts === 0 ? "items" : "item"}`}
                />
              </div>
              <div className="products-list">
                <ProductList products={products} useLoadMore={true} onLoadMore={handleLoadMore} shoppingPage={true} />
              </div>
            </div>
        </div>
        
        <hr className="shopping-hr"/>

        <Footer />
      </div>
    )
}

export default Shopping;