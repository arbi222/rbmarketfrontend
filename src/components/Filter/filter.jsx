import "./filter.css";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import useDropdown from "../../hooks/useDropdown";
import { useDispatch } from "react-redux";
import { getAllCategories } from "../../redux/features/categorySlice";
import { useEffect } from "react";
import { getAllBrands } from "../../redux/features/brandSlice";
import { CircularProgress } from '@mui/material';
import { capitalizeFirstLetter } from "../../utils/helper";

const Filter = ({label, filterType, items, loading, selectedItem, onSelection, usage}) => {

    const dispatch = useDispatch();
    const filterConfig = useDropdown();

    useEffect(() => {
        if (filterConfig.isOpen && items?.length === 0){
            if (filterType === "category"){
                dispatch(getAllCategories());
            }
            if (filterType === "brand"){
                dispatch(getAllBrands());
            }
        }
    }, [filterConfig.isOpen])

    return (
        <div className={`filter-container ${usage}`}>
            {label && <h4 className={`filter-label ${usage}-label`}>{label}</h4>}

            <div ref={filterConfig.ref} className="filter-wrapper">
                <button className={`filter-btn ${usage}-filter-btn`} role="listbox" onClick={() => filterConfig.setIsOpen(!filterConfig.isOpen)}>
                    <span className={`${selectedItem !== "All" ? "selectedItemColor" : ""}`}>{selectedItem}</span>
                    <span>
                        {filterConfig.isOpen ? 
                            <ArrowDropUpIcon style={{marginTop: "3px"}}/>
                            :
                            <ArrowDropDownIcon style={{marginTop: "3px"}}/>
                        }
                    </span>
                </button>
                    
                {filterConfig.isOpen &&
                    <div className={`filter-options ${usage}-filter`}>
                        {!loading ? <>
                        <button className="filter-option-btn first-option-btn" 
                                onClick={() => {onSelection(filterType, "All", null), filterConfig.setIsOpen(false)}}
                                role="option">
                            All
                        </button>
                        {items?.map((item, index) => {
                            const isLast = index === items.length - 1;
                        
                            return (
                                <button key={index} 
                                        className={`filter-option-btn ${isLast ? "last-option-btn" : ""}`} 
                                        onClick={() => {onSelection(filterType, item.name, item._id), filterConfig.setIsOpen(false)}}
                                        role="option">
                                    {capitalizeFirstLetter(item.name)}
                                </button>
                            )}
                        )}
                        </>
                        :
                        <span className="filter-loader"><CircularProgress size={20} thickness={5} /></span>
                    }
                    </div>
                } 
            </div>
        </div>
    )
}

export default Filter;