import { useDispatch, useSelector } from "react-redux";
import "./updateUser.css";
import MarketLogo from "../../components/MarketLogo/marketLogo";
import DeleteIcon from '@mui/icons-material/Delete';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { useEffect, useRef, useState } from "react";
import InputAuthField from "../../components/InputAuthField/inputAuthField";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserPublicData, resetMessages, resetOtherUser, updateAccount } from "../../redux/features/userSlice";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import deleteFile from "../../firebase/deleteFile";
import upload from "../../firebase/upload";
import PageTitle from "../../components/PageTitle/pageTitle";

const UpdateUser = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo, otherUserInfo, isFetchingChecked, loading, error, successMessage } = useSelector((state) => state.user);
    const [ searchParams, setSearchParams ] = useSearchParams();
    const userSlug = searchParams.get("userSlug");

    useEffect(() => {
      if (userSlug){
        dispatch(resetOtherUser());
        dispatch(getUserPublicData({slug: userSlug}));
      }
    }, [userSlug, dispatch]);

    useEffect(() => {
      dispatch(resetMessages());
      if (error) toast.error(error);
      if (successMessage) toast.success(successMessage);
    }, [error, successMessage])
  
    const fileInputRef = useRef();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [mainInfo, setMainInfo] = useState({
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      bio: ""
    });
    const [shippingInfo, setShippingInfo] = useState({
      country: "",
      city: "",
      street: "",
      postalCode: ""
    })
    const [hasChanges, setHasChanges] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

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
      if (!userSlug || !otherUserInfo) return;
      
      setImagePreview(otherUserInfo.avatar || null);
      setMainInfo({
        firstName: otherUserInfo.firstName,
        lastName: otherUserInfo.lastName || "",
        email: otherUserInfo.email,
        mobileNumber: otherUserInfo.mobileNumber,
        bio: otherUserInfo.aboutBio
      })
      setShippingInfo({
        country: otherUserInfo.country || "",
        city: otherUserInfo.city || "",
        street: otherUserInfo.street || "",
        postalCode: otherUserInfo.postalCode || ""
      })
    
    }, [userSlug, otherUserInfo])


    useEffect(() => {
      if (!otherUserInfo || !userSlug) return;

      const changed = 
          mainInfo.firstName !== otherUserInfo.firstName ||
          mainInfo.lastName !== otherUserInfo?.lastName ||
          mainInfo.email !== otherUserInfo.email ||
          mainInfo.mobileNumber !== otherUserInfo?.mobileNumber ||
          mainInfo.bio !== otherUserInfo?.aboutBio ||
          image !== null || 
          shippingInfo.country !== otherUserInfo?.country ||
          shippingInfo.city !== otherUserInfo?.city || 
          shippingInfo.street !== otherUserInfo?.street ||
          shippingInfo.postalCode !== otherUserInfo?.postalCode;
      setHasChanges(changed);

    }, [otherUserInfo, userSlug, mainInfo.firstName, mainInfo.lastName, mainInfo.email, mainInfo.mobileNumber, mainInfo.bio, image, 
        shippingInfo.country, shippingInfo.city, shippingInfo.postalCode, shippingInfo.street])

    const handleUserUpdate = async (e) => {
      e.preventDefault();
      setUpdateLoading(true);

      let uploadedObject = null;

      const requiredData = {
        userId: otherUserInfo._id,
        firstName: mainInfo.firstName,
        lastName: mainInfo.lastName,
        email: mainInfo.email,
        mobileNumber: mainInfo.mobileNumber,
        aboutBio: mainInfo.bio,
        country: shippingInfo.country,
        city: shippingInfo.city,
        street: shippingInfo.street,
        postalCode: shippingInfo.postalCode,
        admin: true,
      }

      if (image){ // this means we are uploading a new photo
        try{
          if (otherUserInfo.avatar && otherUserInfo.avatarFilePath){ // this means this user has already a photo so we need to delete this from DB to update with the new one
            await deleteFile(otherUserInfo.avatarFilePath);
          }
          uploadedObject = await upload(image, "avatars");
          requiredData.avatar = uploadedObject.downloadURL;
          requiredData.avatarFilePath = uploadedObject.filePath;
        }
        catch(firebaseError){
          toast.warn("Something went wrong!");
          console.error(firebaseError);
          setUpdateLoading(false);
          return;
        }
      }

      if (!imagePreview){ // this means the user had a photo but we choose to delete and leave this user without a photo
        try{
          if (otherUserInfo.avatar && otherUserInfo.avatarFilePath){
            await deleteFile(otherUserInfo.avatarFilePath);
            requiredData.avatar = "";
            requiredData.avatarFilePath = "";
          }
        }
        catch(deleteError){
          toast.warn("Deleting old photo went wrong!");
          console.error(deleteError);
          return;
        }
      }

      try{
        await dispatch(updateAccount(requiredData)).unwrap();
        setUpdateLoading(false);
        searchParams.delete("userSlug");
        setSearchParams(searchParams);
        navigate("/admin?tab=users&updating=true");
      }
      catch(err){
        console.error(err);
        setUpdateLoading(false);
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

    if (!userSlug){
      return (
        <div className="no-admin-allowance">
          <MarketLogo />
          <p className='allowance-message'>There is no user with this id!</p>
        </div>
      )
    }

    if (!isFetchingChecked) {
        return (
          <div className="auth-loading-screen">
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }
    
    return (
      <div className="updateUser-page">
        <PageTitle title="Edit User | RB Market" />
        <div className="market-logo-update-page">
          <MarketLogo />
        </div>

        <div className="updateUser-pageWrapper">
          <h1 className="updateUser-header">Update User</h1>

          <div className="profilepicture-updating">
            <h3 className="mini-header">PROFILE PHOTO</h3>
            {imagePreview ? 
                <div className="profile-img-uploaded-section">
                    <img className="profile-img-uploaded" src={imagePreview} alt="profile photo" />
                    <button className="delete-profile-img-btn" title="Remove photo" onClick={() => {setImagePreview(null); fileInputRef.current = ""; setImage(null);}}>
                        <DeleteIcon style={{marginTop: "1px"}}/>
                    </button>
                </div>
            :
                <div className={`drag-drop-profile-img ${isDragging && "dragging-profile-img"}`} 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}>
                    <div className="drag-header-details">
                        <AddToPhotosIcon />
                        Drag and drop image
                    </div>
                    <input type="file" accept="image/*" className="hide" ref={fileInputRef} onChange={handleFileChange}/>
                    <button className="upload-image-btn-user-update" onClick={() => fileInputRef.current.click()}>
                        Upload image
                    </button>
                </div>
            }   
          </div>
          
          <form onSubmit={handleUserUpdate}>
            <div className="main-user-data-section">
                <div className="update-user-input-container">
                  <h3 className="mini-header">MAIN INFO</h3>
                  <InputAuthField className="update-user-input" 
                                  label={"First Name"}
                                  id={"firstName"}
                                  required={true}
                                  value={mainInfo.firstName}
                                  onChange={(e) => setMainInfo(prev => ({...prev, firstName: e.target.value}))}
                  />
                  <InputAuthField className="update-user-input" 
                                  label={"Last Name"}
                                  id={"lastName"}
                                  value={mainInfo.lastName}
                                  onChange={(e) => setMainInfo(prev => ({...prev, lastName: e.target.value}))}
                  />

                  <InputAuthField className="update-user-input" 
                                  label={"Email"}
                                  id={"email"}
                                  required={true}
                                  type={"email"}
                                  value={mainInfo.email}
                                  onChange={(e) => setMainInfo(prev => ({...prev, email: e.target.value}))}
                  />

                  <InputAuthField className="update-user-input" 
                                  label={"Mobile Number"}
                                  id={"number"}
                                  type={"number"}
                                  required={true}
                                  value={mainInfo.mobileNumber}
                                  onChange={(e) => setMainInfo(prev => ({...prev, mobileNumber: e.target.value}))}
                  />

                  <h3 className="mini-header">BIO DESCRIPTION</h3>
                  <textarea className="about-desc-user" value={mainInfo.bio} onChange={(e) => setMainInfo(prev => ({...prev, bio: e.target.value}))}></textarea>
                </div>
            </div>

            <div className="main-user-data-section">
                <div className="update-user-input-container">
                  <h3 className="mini-header">SHIPPING ADDRESS</h3>
                  <InputAuthField className="update-user-input" 
                                  label={"Country"}
                                  id={"country"}
                                  required={true}
                                  value={shippingInfo.country}
                                  onChange={(e) => setShippingInfo(prev => ({...prev, country: e.target.value}))}
                  />

                  <InputAuthField className="update-user-input" 
                                  label={"City"}
                                  id={"city"}
                                  required={true}
                                  value={shippingInfo.city}
                                  onChange={(e) => setShippingInfo(prev => ({...prev, city: e.target.value}))}
                  />

                  <InputAuthField className="update-user-input" 
                                  label={"Street"}
                                  id={"street"}
                                  required={true}
                                  value={shippingInfo.street}
                                  onChange={(e) => setShippingInfo(prev => ({...prev, street: e.target.value}))}
                  />


                  <InputAuthField className="update-user-input" 
                                  label={"Postal Code"}
                                  id={"postalCode"}
                                  type={"number"}
                                  required={true}
                                  value={shippingInfo.postalCode}
                                  onChange={(e) => setShippingInfo(prev => ({...prev, postalCode: e.target.value}))}
                  />
                </div>
            </div>

            <button className={`btn updateUser-btn ${!hasChanges || loading || updateLoading ? "disabled-btn" : ""}`}
                    disabled={!hasChanges || loading || updateLoading}
                    type="submit">
              Update User
            </button>
          </form>
        </div>
      </div>
    )
}

export default UpdateUser;