import "./brand&category.css";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import MarketLogo from "../../components/MarketLogo/marketLogo";
import InputAuthField from "../../components/InputAuthField/inputAuthField";
import { getSingleCategory, resetMessages as resetCategoryMessage, resetSingleCategory } from "../../redux/features/categorySlice";
import { getSingleBrand, resetSingleBrand, resetMessages as resetBrandMessage } from "../../redux/features/brandSlice";
import { toast } from "react-toastify";
import { brandOrCategoryAddOrUpdate } from "../../utils/helper";
import PageTitle from "../../components/PageTitle/pageTitle";

const BrandCategory = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const categoryPage = searchParams.get("categoryPage");
    const categoryId = searchParams.get("categoryId");
    const brandPage = searchParams.get("brandPage");
    const brandId = searchParams.get("brandId");

    const [pageUsage, setPageUsage] = useState(null);
    const [editing, setEditing] = useState(false);
    const [otherLoading, setOtherLoading] = useState(false);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.user);
    const {singleCategory, loading: categoryLoading, isFetchingChecked: isFetchingCheckedCategories, error: errorCategory, successMessage: successMessageCategory} = useSelector((state) => state.category);
    const {singleBrand, loading: brandLoading, isFetchingChecked: isFetchingCheckedBrands, error: errorBrand, successMessage: successMessageBrand} = useSelector((state) => state.brand);
    
    const [mainInfo, setMainInfo] = useState({
        name: "",
        description: ""
    });

    const fileInputRef = useRef();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (categoryPage === "true"){
            setPageUsage("category");
            if (categoryId){
                setEditing(true);
            }
        }
        else if (brandPage === "true"){
            setPageUsage("brand");
            if (brandId){
                setEditing(true);
            }
        }
    }, [categoryPage, categoryId, brandPage, brandId])

    useEffect(() => {
        if (!pageUsage || !editing || !userInfo.isAdmin) return;

        if (pageUsage === "category" && editing){
            dispatch(resetSingleCategory());
            dispatch(getSingleCategory({categoryId}));
        }
        else if (pageUsage === "brand" && editing){
            dispatch(resetSingleBrand());
            dispatch(getSingleBrand({brandId}));
        }
    }, [pageUsage, editing, userInfo])

    useEffect(() => {
        if (!pageUsage || !editing) return;

        if (pageUsage === "category" && editing){
            setImagePreview(singleCategory?.image || null);
            setMainInfo({
              name: singleCategory?.name,
              description: singleCategory?.description,
            })
        }
        else if (pageUsage === "brand" && editing){
            setImagePreview(singleBrand?.image || null);
            setMainInfo({
              name: singleBrand?.name,
              description: singleBrand?.description,
            })
        }
    }, [pageUsage, editing, singleCategory, singleBrand])
    
    useEffect(() => {
      if (!pageUsage || !editing) return;

      let changed = false;
      if (pageUsage === "category" && editing){
        changed = mainInfo.name !== singleCategory?.name ||
                  mainInfo.description !== singleCategory?.description || 
                  image !== null || imagePreview !== singleCategory?.image;
      }
      else if (pageUsage === "brand" && editing){
        changed = mainInfo.name !== singleBrand?.name ||
                  mainInfo.description !== singleBrand?.description || 
                  image !== null || imagePreview !== singleBrand?.image;
      }
      setHasChanges(changed);
    }, [pageUsage, editing, singleBrand, singleCategory, mainInfo.name, mainInfo.description, image, imagePreview])

    useEffect(() => {
        if (pageUsage === "category"){
            if (errorCategory) toast.error(errorCategory);
            if (successMessageCategory) toast.success(successMessageCategory);
            dispatch(resetCategoryMessage());
        }
        if (pageUsage === "brand"){
            if (errorBrand) toast.error(errorBrand);
            if (successMessageBrand) toast.success(successMessageBrand);
            dispatch(resetBrandMessage());
        }
    }, [errorCategory, errorBrand, successMessageBrand, successMessageCategory, pageUsage])

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => setImagePreview(reader.result);
          reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pageUsage === "category"){ // handling category page
            const categoryData = {
                name: mainInfo.name,
                description: mainInfo.description
            };
            await brandOrCategoryAddOrUpdate(categoryData, setOtherLoading, "categories", editing, image, imagePreview, singleCategory, dispatch, navigate);
        }
        else if (pageUsage === "brand"){ // handling brand page
            const brandData = {
                name: mainInfo.name,
                description: mainInfo.description
            };
            await brandOrCategoryAddOrUpdate(brandData, setOtherLoading, "brands", editing, image, imagePreview, singleBrand, dispatch, navigate);
        }
    }

    if (!userInfo.isAdmin){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>You are not allowed to access this page!</p>
            </div>
        )
    }

    if (!pageUsage){
        return (
            <div className='no-admin-allowance'>
              <MarketLogo />
              <p className='allowance-message'>Something went wrong! Page is missing.</p>
            </div>
        )
    }

    if ((pageUsage === "category" && !isFetchingCheckedCategories) || 
        (pageUsage === "brand" && !isFetchingCheckedBrands) || 
        (categoryLoading && !otherLoading) || 
        (brandLoading && !otherLoading)){
        return (
          <div className="auth-loading-screen">
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    return (
      <div className="brand-category-page">
        <PageTitle title={`Edit ${pageUsage === "category" ? "Category" : "Brand"} | RB Market`} />
        <div className="market-logo-brand-category-page">
          <MarketLogo />
        </div>

        <div className="brand-category-pageWrapper">
          <h1 className="brand-category-header">
            {pageUsage === "category" &&
                (editing ? "Edit category" : "Add category")
            }
            {pageUsage === "brand" &&
                (editing ? "Edit brand" : "Add brand")
            }
          </h1>

          <div className="photo-brand-category-updating">
            {imagePreview ? 
                <div className={`${pageUsage === "category" ? "category-photo-uploaded-section" : "brand-photo-uploaded-section"}`}>
                    <img className={`${pageUsage === "category" ? "category-photo-uploaded" : "brand-photo-uploaded"}`} src={imagePreview} alt="photo" />
                    <button className={`${pageUsage === "category" ? "delete-category-photo-btn" : "delete-brand-photo-btn"}`} 
                            title="Remove photo" 
                            onClick={() => {setImagePreview(null); fileInputRef.current = ""; setImage(null);}}>
                        <DeleteIcon style={{marginTop: "1px"}}/>
                    </button>
                </div>
            :
                <div className={`${pageUsage === "category" ? "drag-drop-category-photo" : "drag-drop-brand-photo"} ${isDragging && "dragging-brand-category-photo"}`} 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}>
                    <div className="drag-header-details-brand-category">
                        <AddToPhotosIcon />
                        Drag and drop image
                    </div>
                    <input type="file" accept="image/*" className="hide" ref={fileInputRef} onChange={handleFileChange}/>
                    <button className="upload-image-btn-brand-category-photo" onClick={() => fileInputRef.current.click()}>
                        Upload image
                    </button>
                </div>
            }   
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="main-info-brand-category-section">
                <div className="update-brand-category-input-container">
                  <InputAuthField className="update-brand-category-input" 
                                  label={"Name"}
                                  id={"name"}
                                  required={true}
                                  value={mainInfo.name}
                                  onChange={(e) => setMainInfo(prev => ({...prev, name: e.target.value}))}
                  />

                  <h4 className="mini-page-header">DESCRIPTION</h4>
                  <textarea className="desc-brand-category" 
                            value={mainInfo.description}
                            required 
                            onChange={(e) => setMainInfo(prev => ({...prev, description: e.target.value}))}>
                  </textarea>
                </div>
            </div>
            <button className={`btn update-brand-category-btn ${(editing && !hasChanges) || otherLoading ? "disabled-btn" : ""}`}
                    disabled={(editing && !hasChanges) || otherLoading}
                    type="submit">
                {pageUsage === "category" &&
                    (editing ? "Update category" : "Create category")
                }
                {pageUsage === "brand" &&
                    (editing ? "Update brand" : "Create brand")
                }
            </button>
          </form>
        </div>
      </div>
    )
}

export default BrandCategory;