import "./categories.css";
import DataCardShowing from "../DaraCardShowing/dataCardShowing";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { deleteCategory, getAllCategories, resetMessages } from "../../redux/features/categorySlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { closeGeneralPopUp } from "../../redux/features/uiSlice";
import { toast } from "react-toastify";
import deleteFile from "../../firebase/deleteFile";

const Categories = () => {
    
    const [searchParams, setSearchParams] = useSearchParams();
    const refetch = searchParams.get("refetch");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {categories, loading, error, successMessage} = useSelector((state) => state.category);
    const {generalPopUp} = useSelector((state) => state.ui);
    const [otherLoading, setOtherLoading] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [imageFilePath, setImageFilePath] = useState(null);

    useEffect(() => {
        if (categories.length === 0){
            dispatch(getAllCategories());
        }
    }, [])

    useEffect(() => {
        if (refetch === "true"){
            dispatch(getAllCategories());
        }
    }, [refetch])

    useEffect(() => {
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
        dispatch(resetMessages());
    }, [error, successMessage])

    const handleDeleteCategory = async () => {
        try{
          setOtherLoading(true);
          if (imageFilePath){
            await deleteFile(imageFilePath);
          }
          await dispatch(deleteCategory({categoryId: deleteItemId})).unwrap();
          dispatch(closeGeneralPopUp());
          setDeleteItemId(null);
          setImageFilePath(null);
          navigate("/admin?tab=categories&refetch=true");
        }
        catch(err){
          console.error(err);
        }
        finally{
            setOtherLoading(false);
        }
    }

    if (loading){
        return (
            <div className='category-loading-screen'>
                <CircularProgress size={40} thickness={5} />
            </div>
        )
    }

    if (categories.length === 0){
        return (
            <div className="no-categories-admin">
                <h2>There are no categories available for now.</h2>
            </div>
        )
    }

    return (
      <div className="categories-container">
        {categories?.map((category, index) => (
            <div data-aos={"zoom-in"}
                data-aos-delay={index * 100} 
                data-aos-duration={"800"}
                key={category._id}>
                <DataCardShowing usage={"categories"} item={category} setImageFilePath={setImageFilePath} setDeleteItemId={setDeleteItemId}/>
            </div>
        ))}

        {generalPopUp === "YesNo" &&
          <GeneralPopUp usage="YesNo"
              showLastBtns={false} 
              closePopUp={() => {dispatch(closeGeneralPopUp())}}
              content={() => (
                <div className='popup-asking-delete'>
                  <h3>
                    Delete category
                  </h3>
                  <p>
                    Are you sure you want to delete this category?
                  </p>
                  <div className='YesNoBtns'>
                      <button disabled={loading || otherLoading} 
                              className={loading || otherLoading ? "disabled-btn" : ""} 
                              onClick={() => {dispatch(closeGeneralPopUp())}}>
                          No
                      </button>
                      <button disabled={loading || otherLoading} 
                              className={loading || otherLoading ? "disabled-btn" : ""} 
                              onClick={handleDeleteCategory}
                              >
                          Yes
                      </button>
                  </div>
                </div>
              )}
          />
        }
      </div>
    )
}

export default Categories;