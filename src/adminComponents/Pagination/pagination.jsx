import "./pagination.css";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getPageNumbers } from "../../utils/helper";

const Pagination = ({totalPages, currentPage, setCurrentPage}) => {

    return (
      <div className="admin-pagination">
        <button
          className="btn f-prev-btn-admin" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ArrowBackIcon fontSize="small" style={{marginTop: "3px"}}/>
        </button>

        {getPageNumbers(currentPage, totalPages).map((num, index) => 
          num === "..." ?
            <div key={index} className="ellipsis-div">
              <div className="ellipsis"></div>
              <div className="ellipsis"></div>
              <div className="ellipsis"></div>
            </div>
          :
          (
          <button
            key={index} 
            onClick={() => setCurrentPage(num)} 
            className={currentPage === num ? "active number-btn-admin" : "number-btn-admin"}
          >
            {num}
          </button>
        ))}
        
        <button
          className="btn f-next-btn-admin" 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <ArrowForwardIcon fontSize="small" style={{marginTop: "3px"}}/>
        </button>
      </div>
    )
}

export default Pagination;