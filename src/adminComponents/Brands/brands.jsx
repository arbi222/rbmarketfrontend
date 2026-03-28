import { useDispatch, useSelector } from "react-redux";
import "./brands.css";
import { CircularProgress } from "@mui/material";
import DataCardShowing from "../DaraCardShowing/dataCardShowing";
import { deleteBrand, getAllBrands, resetMessages } from "../../redux/features/brandSlice";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GeneralPopUp from "../../popUps/GeneralPopUp/generalPopUp";
import { closeGeneralPopUp } from "../../redux/features/uiSlice";
import { toast } from "react-toastify";
import deleteFile from "../../firebase/deleteFile";

const Brands = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const refetch = searchParams.get("refetch");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { brands, loading, error, successMessage } = useSelector((state) => state.brand);
    const {generalPopUp} = useSelector((state) => state.ui);
    const [otherLoading, setOtherLoading] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [imageFilePath, setImageFilePath] = useState(null);

    useEffect(() => {
        if (brands.length === 0){
            dispatch(getAllBrands());
        }
    }, [brands])

    useEffect(() => {
        if (refetch === "true"){
            dispatch(getAllBrands());
        }
    }, [refetch])

    useEffect(() => {
        if (error) toast.error(error);
        if (successMessage) toast.success(successMessage);
        dispatch(resetMessages());
    }, [error, successMessage])

    const handleDeleteBrand = async () => {
        try{
          setOtherLoading(true);
          if (imageFilePath){
            await deleteFile(imageFilePath);
          }
          await dispatch(deleteBrand({brandId: deleteItemId})).unwrap();
          dispatch(closeGeneralPopUp());
          setDeleteItemId(null);
          setImageFilePath(null);
          navigate("/admin?tab=brands&refetch=true");
        }
        catch(err){
          console.error(err);
        }
        finally{
            setOtherLoading(false);
        }
    };

    if (loading){
        return (
            <div className='brand-loading-screen'>
                <CircularProgress size={40} thickness={5} />
            </div>
        )
    }

    if (brands.length === 0){
        return (
            <div className="no-brands-admin">
                <h2>There are no brands available for now.</h2>
            </div>
        )
    }

    return (
      <div className="brands-admin-container">
        {brands?.map((brand, index) => (
            <div data-aos={"zoom-in"}
                data-aos-delay={index * 100} 
                data-aos-duration={"800"}
                key={brand._id}>
                <DataCardShowing item={brand} usage={"brands"} setImageFilePath={setImageFilePath} setDeleteItemId={setDeleteItemId}/>
            </div>
        ))}

        {generalPopUp === "YesNo" &&
          <GeneralPopUp usage="YesNo"
              showLastBtns={false} 
              closePopUp={() => {dispatch(closeGeneralPopUp())}}
              content={() => (
                <div className='popup-asking-delete'>
                  <h3>
                    Delete brand
                  </h3>
                  <p>
                    Are you sure you want to delete this brand?
                  </p>
                  <div className='YesNoBtns'>
                      <button disabled={loading || otherLoading} 
                              className={loading || otherLoading ? "disabled-btn" : ""} 
                              onClick={() => {dispatch(closeGeneralPopUp())}}>
                          No
                      </button>
                      <button disabled={loading || otherLoading} 
                              className={loading || otherLoading ? "disabled-btn" : ""} 
                              onClick={handleDeleteBrand}
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

export default Brands;