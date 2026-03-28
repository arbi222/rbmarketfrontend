import { useEffect, useState } from "react";
import "./productList.css";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPageNumbers } from "../../utils/helper";
import { CircularProgress } from "@mui/material";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useDropdown from "../../hooks/useDropdown";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { closeGeneralPopUp, openGeneralPopUp } from "../../redux/features/uiSlice";
import { deleteProduct, resetMessages } from "../../redux/features/productSlice";
import deleteFile from "../../firebase/deleteFile";
import { toast } from "react-toastify";

const ProductList = ({products = [], currentPage, setCurrentPage, useLoadMore = false, onLoadMore, shoppingPage = false}) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.user);
    const { generalPopUp } = useSelector((state) => state.ui);
    const { totalPages, hasMore, loading, isFetchingChecked, successMessage } = useSelector((state) => shoppingPage ? state.product.shopping : state.product.store);
    const [loadMoreClicked, setLoadMoreClicked] = useState(false);

    const settingsProductRef = useDropdown();
    const [productIdSetting, setProductIdSetting] = useState({
      productId: null,
      imageFilePath: ""
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
      if (products.length === 0) {
        setLoadMoreClicked(false);
      }
    }, [products.length]);

    useEffect(() => {
      if (successMessage) toast.success(successMessage);
      dispatch(resetMessages());
    }, [successMessage])

    const editProduct = (productSlug) => {
      navigate(`/list-item?product=${productSlug}`);
    }

    const removeProduct = (productId, imageFilePath) => {
      dispatch(openGeneralPopUp("YesNo"));
      setProductIdSetting({productId, imageFilePath});
    }

    const handleCancelDelete = () => {
        dispatch(closeGeneralPopUp());
        setProductIdSetting({
          productId: null,
          imageFilePath: ""
        });
    }

    const handleDeleteProduct = async () => {
      if (deleting) return;
      setDeleting(true);
      try{
        await dispatch(deleteProduct({productId: productIdSetting.productId})).unwrap();
        if (productIdSetting.imageFilePath){
          await deleteFile(productIdSetting.imageFilePath);
        }
        handleCancelDelete();

        if (products.length === 1 && currentPage > 1){  
          setCurrentPage(prev => prev - 1);
        }
      }
      catch (err){
        console.error(err);
      }
      finally{
        setDeleting(false);
      }
    }

    if (!isFetchingChecked && loading && !loadMoreClicked){
      return (
        <div className="shopping-loader">
          <CircularProgress size={30} />
        </div>
      )
    }

    if (isFetchingChecked && products.length < 1){
      return (
        <div className={`no-items-found ${shoppingPage ? "centerMid" : ""}`}>
          <p>No products were found.</p>
        </div>
      )
    }

    return (
      <>
        <div className="product-grid" ref={settingsProductRef.ref}>
          {products.map((p) => (
              <div className="product-card-container" key={p._id}>
                <Link to={`/item/${p.slug}`} className="card-link">
                    <img src={p.image || defaultProductPicture} alt={p.title} className="product-img" onError={(e) => {e.currentTarget.src = defaultProductPicture}}/>
                    <div className="product-info">
                        <h3>{p.title}</h3>
                        <div className="product-details">
                          <p className="price">${(p.price / 100).toFixed(2)}</p>
                          {p.stock < 1 ?
                            <p className="out-of-stock">Out of stock</p>
                          :
                            <p className="stock">Stock: {p.stock}</p>
                          }
                        </div>
                    </div>
                </Link>
                {(userInfo._id === p.seller && !shoppingPage) &&
                  <button className="settings-product-card-btn btn"
                          title="Product settings"
                          onClick={() => settingsProductRef.setIsOpen(settingsProductRef.isOpen === p._id ? false : p._id)}
                  >
                    <MoreVertIcon style={{marginTop: "3px"}}/>
                  </button>
                }
                {settingsProductRef.isOpen === p._id &&
                  <div className="product-card-settings-tab">
                    <button className="edit-product-btn btn" onClick={() => editProduct(p.slug)}>
                      Edit
                    </button>
                    <button className="remove-product-btn btn" onClick={() => removeProduct(p._id, p.imageFilePath)}>
                      Delete
                    </button>
                  </div>
                }
              </div>
          ))}
        </div>

        {!useLoadMore && totalPages > 1 && (
          <div className="pagination">
            <button
              className="shop-number-btn shop-prev-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ArrowBackIcon fontSize="small" style={{marginTop: "3px"}}/>
            </button>

            {getPageNumbers(currentPage, totalPages).map((num, i) => 
              num === "..." ?
              <div key={i} className="ellipsis-div">
                <div className="ellipsis"></div>
                <div className="ellipsis"></div>
                <div className="ellipsis"></div>
              </div>
              :
            (
              <button
                key={i}
                className={`shop-number-btn page-btn ${currentPage === num ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="shop-number-btn shop-next-btn" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ArrowForwardIcon fontSize="small" style={{marginTop: "3px"}}/>
            </button>
          </div>
        )}

        {useLoadMore && hasMore && (
            <div className="load-more-container">
              <button
                className={`load-more-btn ${loading ? 'disabled-btn disable-btn' : ""}`}
                onClick={() => {
                  setLoadMoreClicked(true);
                  onLoadMore();
                }}
                disabled={loading}
              >
                {loading && loadMoreClicked ? 
                  <span>
                    <CircularProgress size={15} style={{marginTop: "3px"}}/>
                  </span>
                :
                  "Show More"
                }
              </button>
            </div>
        )}


        {generalPopUp === "YesNo" &&
          <GeneralPopUp usage="YesNo"
                      showLastBtns={false} 
                      closePopUp={handleCancelDelete}
                      content={() => (
                        <div className='popup-asking-delete'>
                          <h3>Delete product</h3>
                          <p>Are you sure you want to delete this product?</p>
                          <div className='YesNoBtns'>
                              <button disabled={deleting} className={deleting ? "disabled-btn" : ""} onClick={handleCancelDelete}>No</button>
                              <button disabled={deleting} className={deleting ? "disabled-btn" : ""} onClick={handleDeleteProduct}>Yes</button>
                          </div>
                        </div>
                      )}
          />
        }
      </>
    )
}

export default ProductList;