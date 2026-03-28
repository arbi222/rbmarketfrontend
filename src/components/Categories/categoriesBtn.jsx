import "./categoriesBtn.css";
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

const CategoriesBtn = ({btnOn}) => {
  return (
    <div className='categories_panel'>
        <button id='categories'>Shop by category</button>
        <label htmlFor="categories">
            <KeyboardArrowDownOutlinedIcon 
                className={`${btnOn ? "icon-rotate" : ""}`} 
                style={{transition: "transform 0.4s ease", fontSize: "20px"}}
            />
        </label>
    </div>
  )
}

export default CategoriesBtn