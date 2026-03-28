import "./searchBar.css";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

const SearchBar = ({usage, value, onChange, onClear, onClick, onSearch, placeholder}) => {

  const [showClearBtn, setClearBtn] = useState(false);

  useEffect(() => {
    if (value?.length > 0){
      setClearBtn(true)
    }
    else{
      setClearBtn(false)
    }
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === "Enter"){
      e.preventDefault();
      if (onSearch && value.length > 0) onSearch(value);
    }
  }

  return (
    <div className={`search-panel ${usage}-width`} >
        <label htmlFor="search_bar"><SearchIcon fontSize="small"/></label>
        <input id='search_bar' 
              type="text" 
              placeholder={placeholder}
              value={value}
              onClick={onClick}
              onChange={onChange}
              onKeyDown={handleKeyDown}
        />
        {showClearBtn &&
          <button className="btn delete-search-bar-btn" title="Clear search bar" onClick={onClear}>
            <CloseIcon fontSize="small"/>
          </button>
        }
        {onSearch &&
          <button className="btn search-bar-btn" title="Search" onClick={() => value.length > 0 && onSearch(value)}>
            <SearchIcon fontSize="small"/>
          </button>
        }
    </div>
  )
}

export default SearchBar;