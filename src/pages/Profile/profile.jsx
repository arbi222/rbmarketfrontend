import { useState, useEffect } from "react";
import Footer from "../../components/Footer/footer";
import Navbar from "../../components/Navbar/navbar";
import ProfileAvatar from "../../components/ProfileAvatar/profileAvatar";
import ProfileSections from "../../components/ProfileSections/profileSections";
import "./profile.css";
import { useDispatch, useSelector } from "react-redux";
import { getUserPublicData, resetMessages, setUserInfo, updateAccount } from "../../redux/features/userSlice";
import { toast } from "react-toastify";
import upload from "../../firebase/upload";
import deleteFile from "../../firebase/deleteFile";
import { exitEditingProfile } from "../../redux/features/uiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Profile = () => {

  const {slug} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {userInfo, otherUserInfo, isFetchingChecked, error, successMessage} = useSelector((state) => state.user);
  const {aboutBio} = useSelector((state) => state.ui);

  const [otherLoading, setOtherLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    dispatch(getUserPublicData({slug: slug}));
  }, [slug]);

  useEffect(() => {
    if (isFetchingChecked && otherUserInfo === null){
      navigate("/");
    }
  }, [isFetchingChecked, otherUserInfo])

  useEffect(() => {
    if (error) toast.error(error);
    if (successMessage) toast.success(successMessage);
  }, [error, successMessage]);

  const handleSave = async () => {
    let uploadedObject = null;
    setOtherLoading(true);

    try{
      const requiredData = {
        userId: userInfo._id,
      }
      let hasChanges = false;

      if (uploadedFile === "default"){
        if (userInfo.avatar && userInfo.avatarFilePath){
          try{
            await deleteFile(userInfo.avatarFilePath);
            requiredData.avatar = "";
            requiredData.avatarFilePath = "";
            hasChanges = true;
          }
          catch (deleteErr){
            toast.warn("Failed to delete the uploaded image.");
            setOtherLoading(false);
            return;
          }
        }
        else{
          requiredData.avatar = "";
          hasChanges = true;
        }
      }
      else if (uploadedFile && uploadedFile !== "default"){
        uploadedObject = await upload(uploadedFile, "avatars");
        requiredData.avatar = uploadedObject.downloadURL;
        requiredData.avatarFilePath = uploadedObject.filePath;
        hasChanges = true;
      }

      if (aboutBio !== userInfo.aboutBio){
        requiredData.aboutBio = aboutBio;
        hasChanges = true;
      } 

      if (!hasChanges){
        toast.info("No changes detected.");
        setOtherLoading(false);
        return;
      }

      await dispatch(updateAccount(requiredData)).unwrap();
      const { userId, ...payload } = requiredData;
      dispatch(setUserInfo({...userInfo, ...payload}));
      dispatch(exitEditingProfile());
    }
    catch(err){
      console.error("Failed to update profile: ", err.message);
      if (uploadedObject){
        try{
          await deleteFile(uploadedObject.filePath);
        }
        catch (deleteError){
          toast.warn("Failed to delete the uploaded image.");
        }
      }
    }
    finally{
      dispatch(resetMessages());
      setOtherLoading(false);
    } 
  }

  if (!isFetchingChecked || otherUserInfo === null) {
    return (
      <div className='auth-loading-screen'>
        <CircularProgress size={40} thickness={5} />
      </div>
    )
  }

  return (
    <div className="profile-container">
        <PageTitle title="Profile | RB Market" />
        <PayMethodAction from={"/checkout?"} />
        <Navbar usage="profile" />
        <ProfileAvatar onSave={handleSave} onLoading={otherLoading} setUploadedFile={setUploadedFile} />
        <ProfileSections />
        <Footer usage="profile"/>
    </div>
  )
}

export default Profile;