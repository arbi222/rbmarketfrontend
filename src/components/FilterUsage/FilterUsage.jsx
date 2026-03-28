import { useState } from "react";
import "./filterUsage.css";
import Filter from "../Filter/filter";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, resetShopping, resetStore } from "../../redux/features/productSlice";

const FilterUsage = ({usage, selectedFilters, setSelectedFilters, debouncedQuery, sellerSlug}) => {

    const isShoppingPage = usage === "shopping";
    const isProfilePage = usage === "profile";

    const dispatch = useDispatch();
    const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
    const { brands, loading: brandsLoading } = useSelector((state) => state.brand);

    const conditions = [
        { _id: 1, name: "New" },
        { _id: 2, name: "Used" }
    ];

    const prices = [
        { _id: 1, name: "Under $50" },
        { _id: 2, name: "$50 - $100" },
        { _id: 3, name: "$101 - $500" },
        { _id: 4, name: "$501+" },
    ];
    
    const handleFilter = (filterType, value, id) => {
        setSelectedFilters(prev => ({
          ...prev,
          [filterType]: value,
          [`${filterType}Id`]: id
        }));
    
        const payload = {
          category: filterType === "category" ? id : selectedFilters.categoryId,
          brand: filterType === "brand" ? id : selectedFilters.brandId,
          condition: filterType === "condition" ? id : selectedFilters.conditionId,
          price: filterType === "price" ? id : selectedFilters.priceId,
        };

        if (debouncedQuery){
            payload.title = debouncedQuery;
        }

        if (isShoppingPage){
            payload.skip = 0;
            dispatch(resetShopping());
            dispatch(getAllProducts(payload));
        }
        else if (isProfilePage){
            payload.sellerSlug = sellerSlug;
            payload.page = 1;
            dispatch(resetStore());
            dispatch(getAllProducts(payload));
        }
        else {
            return;
        }
    }

    return (
      <div className={`${usage}-filters-container`}>
        <div className={`${usage}-filter-item`}>
            <Filter label="Categories"
                filterType="category" 
                items={categories}
                loading={categoriesLoading}
                selectedItem={selectedFilters.category}
                onSelection={handleFilter}
                usage={isProfilePage ? "profileFilter" : null}
            />
        </div>
        
        <div className={`${usage}-filter-item`}>
            <Filter label="Brands"
                filterType="brand" 
                items={brands}
                loading={brandsLoading}
                selectedItem={selectedFilters.brand}
                onSelection={handleFilter}
                usage={isProfilePage ? "profileFilter" : null}
            />
        </div>

        <div className={`${usage}-filter-item`}>
            <Filter label="Condition"
                filterType="condition" 
                items={conditions}
                selectedItem={selectedFilters.condition}
                onSelection={handleFilter}
                usage={isProfilePage ? "profileFilter" : null}
            />
        </div>

        <div className={`${usage}-filter-item`}>
            <Filter label="Prices"
                filterType="price" 
                items={prices}
                selectedItem={selectedFilters.price}
                onSelection={handleFilter}
                usage={isProfilePage ? "profileFilter" : null}
            />
        </div>
      </div>
    )
}

export default FilterUsage;