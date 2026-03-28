import { useEffect, useRef, useState } from "react";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import Footer from "../../components/Footer/footer";
import "./listItem.css";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HoverMenu from "../../components/HoverMenu/hoverMenu";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../redux/features/categorySlice";
import { getAllBrands } from "../../redux/features/brandSlice";
import deleteFile from "../../firebase/deleteFile";
import { toast } from "react-toastify";
import useDropdown from "../../hooks/useDropdown";
import { createProduct, getSingleProduct, resetMessages, resetSingleProduct, updateProduct } from "../../redux/features/productSlice";
import { CircularProgress } from '@mui/material';
import upload from "../../firebase/upload";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { closeGeneralPopUp, openGeneralPopUp } from "../../redux/features/uiSlice";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { sendEmailVerification, setEmailToken, resetMessages as resetUserMessages } from "../../redux/features/userSlice";
import PageTitle from "../../components/PageTitle/pageTitle";

const ListItem = () => {

    const [ searchParams, setSearchParams ] = useSearchParams();
    const productSlug = searchParams.get("product");
    const isAdmin = searchParams.get("admin");

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo, emailLoading, error: emailError } = useSelector((state) => state.user);
    const { generalPopUp } = useSelector((state) => state.ui);
    const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
    const { brands, loading: brandsLoading } = useSelector((state) => state.brand);
    const { product, loading, successMessage, error } = useSelector((state) => state.product.singleProduct);

    const fileInputRef = useRef();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showDeleteImageBtn, setShowDeleteImageBtn] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [title, setTitle] = useState("");

    const [categoryValue, setCategoryValue] = useState({value: "", id: ""});
    const categoriesConfig = useDropdown();

    const [brandValue, setBrandValue] = useState({value: "", id: ""});
    const brandsConfig = useDropdown();

    const [itemCondition, setItemCondition] = useState("");

    const [itemDescriptionValue, setItemDescriptionValue] = useState("");

    const [priceValue, setPriceValue] = useState(1);
    const [stockValue, setStockValue] = useState(1); 

    const [listBtnState, setListBtnState] = useState(true);
    const [loadingListing, setLoadingListing] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!productSlug) return;

        dispatch(resetSingleProduct());
        dispatch(getSingleProduct({slug: productSlug}));
    }, [productSlug, dispatch])


    useEffect(() => {
        if (!productSlug || !product) return;
        
        setImagePreview(product.image || null);
        setTitle(product.title || "");
        setCategoryValue({
            value: product.category?.name || "",
            id: product.category?._id || ""
        });
        setBrandValue({
            value: product.brand?.name || "",
            id: product.brand?._id || ""
        });
        setItemCondition(product.condition || "");
        setItemDescriptionValue(product.description || "");
        setPriceValue((product.price / 100).toFixed(2) || 1);
        setStockValue(product.stock || 1);

    }, [productSlug, product])


    useEffect(() => {
        if (!product || !productSlug) return;

        const changed = 
            title !== product.title ||
            categoryValue.id !== product.category?._id ||
            brandValue.id !== product.brand?._id ||
            itemCondition !== product.condition ||
            itemDescriptionValue !== product.description ||
            Number(priceValue) !== Number((product.price / 100).toFixed(2)) ||
            Number(stockValue) !== product.stock ||
            imagePreview !== product.image;
        setHasChanges(changed);

    }, [product, productSlug, title, categoryValue, brandValue, itemCondition, itemDescriptionValue, priceValue, stockValue, imagePreview])

    useEffect(() => {
        if (location.pathname !== "/list-item") return;

        if (userInfo.verifyEmailToken){
            dispatch(openGeneralPopUp("emailVerifyLinkSent"));
            return;
        }

        if (!userInfo.isEmailVerified){
            dispatch(openGeneralPopUp("emailVerify"));
        } 
    }, [userInfo, location.pathname])

    useEffect(() => {
        return () => {
          dispatch(closeGeneralPopUp());
        };
    }, [dispatch]);

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

    useEffect(() => {
        if (categoriesConfig.isOpen && categories.length === 0){
          dispatch(getAllCategories());
        }
    }, [categoriesConfig.isOpen])

    const handleCategoryChoosing = (id, text) => {
      setCategoryValue({value: text, id: id});
      categoriesConfig.setIsOpen(false);
    }

    useEffect(() => {
        if (brandsConfig.isOpen && brands.length === 0){
          dispatch(getAllBrands());
        }
    }, [brandsConfig.isOpen])

    const handleBrandsChoosing = (id, text) => {
      setBrandValue({value: text, id: id});
      brandsConfig.setIsOpen(false);
    }

    useEffect(() => {
        if (emailError) toast.error(emailError);
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
        dispatch(resetMessages());
        dispatch(resetUserMessages());
    }, [error, emailError, successMessage]);

    useEffect(() => {
        const fields = [imagePreview, title, categoryValue.value, brandValue.value, itemCondition, itemDescriptionValue, priceValue, stockValue];
        const isInvalid = fields.some(field => !field);

        if (stockValue < 1 || isInvalid){
            setListBtnState(true);
        }
        else{
            setListBtnState(false);
        }

    }, [imagePreview, title, categoryValue.value, brandValue.value, itemCondition, itemDescriptionValue, priceValue, stockValue]);


    const handleListing = async () => {
        setLoadingListing(true);
        let uploadedObject = null;

        const numericPrice = Number(priceValue);
        const numericStock = Number(stockValue);

        if (numericPrice <= 1){
            toast.warn("Price should be above 1$.");
            setLoadingListing(false);
            return;
        }

        if (productSlug && product){ // here we are editing the product 
            try{
                if (image){
                    uploadedObject = await upload(image, "products");

                    if (product.imageFilePath){
                        await deleteFile(product.imageFilePath);
                    }
                }

                const productData = {
                    _id: product._id,
                    title: title,
                    description: itemDescriptionValue,
                    price: numericPrice,
                    stock: numericStock,
                    category: categoryValue.id,
                    brand: brandValue.id,
                    condition: itemCondition,
                }

                if (uploadedObject){
                    productData.image = uploadedObject.downloadURL
                    productData.imageFilePath = uploadedObject.filePath
                }

                dispatch(resetSingleProduct());
                const res = await dispatch(updateProduct(productData)).unwrap();
                setLoadingListing(false);
                searchParams.delete("product");
                setSearchParams(searchParams);
                if (isAdmin === "true"){
                    navigate("/admin?tab=products&updating=true");
                }
                else{
                    navigate("/item/" + res.product.slug);
                }
            }
            catch(err){
                console.error("Failed to list product: ", err.message);
                if (uploadedObject){
                    try{
                      await deleteFile(uploadedObject.filePath);
                    }
                    catch (deleteError){
                      toast.warn("Failed to delete the uploaded image.");
                    }
                }
                setLoadingListing(false);
            }
        }
        else{
            try{
                dispatch(resetSingleProduct());
                uploadedObject = await upload(image, "products");

                const productData = {
                    title: title,
                    description: itemDescriptionValue,
                    price: numericPrice,
                    stock: numericStock,
                    category: categoryValue.id,
                    brand: brandValue.id,
                    condition: itemCondition,
                    image: uploadedObject.downloadURL,
                    imageFilePath: uploadedObject.filePath
                }

                const res = await dispatch(createProduct(productData)).unwrap();
                setLoadingListing(false);
                navigate("/item/" + res.product.slug);
            }
            catch(err){
                console.error("Failed to list product: ", err.message);
                if (uploadedObject){
                    try{
                      await deleteFile(uploadedObject.filePath);
                    }
                    catch (deleteError){
                      toast.warn("Failed to delete the uploaded image.");
                    }
                }
                setLoadingListing(false);
            }
        }
    }

    const handleGoBack = () => {
        dispatch(closeGeneralPopUp());
        navigate("/");
    }

    const [showEmailVerifyBtns, setEmailVerifyBtns] = useState(true);
    const [verifyEmailBtn, setVerifyEmailBtn] = useState("Verify now");
    const [emailContent, setEmailContent] = useState("");
    const handleVerifyEmail = async () => {
        try{
          await dispatch(sendEmailVerification()).unwrap();
          setVerifyEmailBtn("Email sent");
          setEmailContent("Check your email inbox in order to verify your email address. Redirecting to homepage.");
          setEmailVerifyBtns(false);
          setTimeout(() => {
            dispatch(closeGeneralPopUp());
            navigate("/");
            dispatch(setEmailToken());
          }, 5000);
        }
        catch(err){
          console.error(err);
        }
    }


    if (productSlug && loading){
        return (
            <div className='auth-loading-screen'>
                <CircularProgress size={40} thickness={5} />
            </div>
        )
    }

    return (
      <div className="listItem-page">
        <PageTitle title="List Item | RB Market" />
        <div className="market-logo-navbar">
            <MarketLogo />
        </div>

        <div className="listItem-wrapper">
            <h1 className="listing-header">{(productSlug && product) ? "Update Product" : "Set up your listing"}</h1>

            {/* image handler */}
            <div className="image-uploading">
                <h3 className="under-header">PHOTO</h3>
                <p>Photo is the most important thing the buyers see at first.</p>
                {imagePreview ? 
                    <div className="image-uploaded-section" onMouseEnter={() => setShowDeleteImageBtn(true)} onMouseLeave={() => setShowDeleteImageBtn(false)}>
                        <img className="image-uploaded" src={imagePreview} alt="product-listing-image" />
                        {showDeleteImageBtn && 
                            <button className="delete-uploaded-img" onClick={() => {setImagePreview(null); fileInputRef.current = "";}}>
                                <DeleteIcon style={{marginTop: "1px"}}/>
                            </button>
                        }
                    </div>
                :
                    <div className={`drag-drop ${isDragging && "dragging"}`} 
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="drag-header">
                            <AddToPhotosIcon />
                            Drag and drop image
                        </div>
                        <input type="file" accept="image/*" className="hide" ref={fileInputRef} onChange={handleFileChange}/>
                        <button className="upload-image-btn" onClick={() => fileInputRef.current.click()}>
                            Upload image
                        </button>
                    </div>
                }   
            </div>

            {/* title */}
            <div className="listing-title listing-border">
                <h3 className="under-header">TITLE</h3>
                <label htmlFor="title-input">Item title</label>
                <input id="title-input" type="text" maxLength="100" value={title} onChange={(e) => setTitle(e.target.value)}/>
                <span>{title.length}/100</span>
            </div>

            {/* item category */}
            <div className="listing-border">
                <h3 className="under-header">CATEGORY</h3>
                <div ref={categoriesConfig.ref} className="selector">
                    <button className="category-btn-listing" onClick={() => categoriesConfig.setIsOpen(!categoriesConfig.isOpen)}>
                        <span className="btn-value">{categoryValue.value}</span>
                        <span className="btn-icon"><KeyboardArrowDownIcon /></span>
                    </button>

                    {categoriesConfig.isOpen && 
                        <HoverMenu menu="listing-categories" items={categories} onClickItem={handleCategoryChoosing} loading={categoriesLoading} />
                    }
                </div>
            </div>

            {/* item brand */}
            <div className="listing-border">
                <h3 className="under-header">BRAND</h3>
                <div ref={brandsConfig.ref} className="selector">
                    <button className="category-btn-listing" onClick={() => brandsConfig.setIsOpen(!brandsConfig.isOpen)}>
                        <span className="btn-value">{brandValue.value}</span>
                        <span className="btn-icon"><KeyboardArrowDownIcon /></span>
                    </button>

                    {brandsConfig.isOpen && 
                        <HoverMenu menu="listing-categories" items={brands} onClickItem={handleBrandsChoosing} loading={brandsLoading}/>
                    }
                </div>
            </div>

            {/* item condition */}
            <div className="listing-condition listing-border">
                <h3 className="under-header">CONDITION</h3>
                <div className="condition-radio">
                    <label>
                        <input type="radio" 
                            name="condition"
                            value="New" 
                            checked={itemCondition === "New"}
                            onChange={(e) => setItemCondition(e.target.value)}
                        />
                        <span>New</span>
                    </label>

                    <label>
                        <input type="radio" 
                            name="condition"
                            value="Used" 
                            checked={itemCondition === "Used"}
                            onChange={(e) => setItemCondition(e.target.value)}
                            />
                        <span>Used</span>
                    </label>
                </div>
            </div>

            {/* item description */}
            <div className="listing-description listing-border">
                <h3 className="under-header">DESCRIPTION</h3>
                <textarea className="description-textarea" 
                            value={itemDescriptionValue} 
                            onChange={(e) => setItemDescriptionValue(e.target.value)}
                ></textarea>
            </div>

            {/* item price & STOCK */}
            <div className="listing-price listing-border">
                <h3 className="under-header">PRICE & STOCK</h3>
                <div className="price-input">
                    <label htmlFor="price">Price</label>
                    <div className="price-item">
                        <input id="price" type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)}/>
                        <span>$</span>
                    </div>
                </div>
                <div className="price-input">
                    <label htmlFor="stock">Stock</label>
                    <input id="stock" type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)}/>
                </div>
            </div>

            <div className="listing-footer">
                <h2 className="under-header">List it for free.</h2>
                <p>A final value <label title={`${import.meta.env.VITE_PLATFORM_FEE_PERCENT}%`}>fee</label> applies when your item sells.</p>
                <button className={`btn ${listBtnState || loading || loadingListing || (productSlug && !hasChanges) ? "disabled-btn" : ""}`} 
                        disabled={listBtnState || loading || loadingListing || (productSlug && !hasChanges)} 
                        onClick={handleListing}
                >
                    {loading || loadingListing ? 
                        <CircularProgress className="circular-loader-sign-in" size="25px" thickness="6"/> 
                        : 
                        (productSlug && product) ?
                            "Update product" 
                            :
                            "List product"
                    }
                </button>
            </div>
        </div>

        <Footer usage="home"/>

        {(generalPopUp === "emailVerify" || generalPopUp === "emailVerifyLinkSent") &&
            <GeneralPopUp usage={generalPopUp}
                        showLastBtns={generalPopUp === "emailVerifyLinkSent" ? false : showEmailVerifyBtns}
                        cancelBtnText="Back"
                        onCancel={handleGoBack}
                        saveBtnText={verifyEmailBtn}
                        onSave={handleVerifyEmail}
                        loading={emailLoading}
                        closePopUp={handleGoBack}
                        content={()=> (
                            <p className={`${emailContent || generalPopUp === "emailVerifyLinkSent" ? 'emailContent' : ""}`}>
                                {generalPopUp === "emailVerify" &&
                                    (emailContent ? emailContent : <>Click the <b>verify now</b> button below in order to send an email verification link into your email address.</>)
                                }
                                {generalPopUp === "emailVerifyLinkSent" && "Check your email address for a message from RB Market. The verification link has already been sent."}
                            </p>
                        )} 
            />
        }

      </div>
    )
}

export default ListItem;