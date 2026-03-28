import { useEffect, useRef, useState } from "react";
import "./profileAvatar.css";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from '@mui/icons-material/Edit';
import { CircularProgress } from '@mui/material';
import UploadImage from "../UploadImage/uploadImage";
import defaultProfilePic from "../../../public/assets/defaultPerson.jpg";
import { exitEditingProfile, startEditingProfile } from "../../redux/features/uiSlice";
import { setAboutBio } from "../../redux/features/uiSlice";
import { Link, useLocation } from "react-router-dom";

const ProfileAvatar = ({onSave, onLoading, setUploadedFile}) => {

    const location = useLocation();
    const dispatch = useDispatch();
    const { userInfo, otherUserInfo, loading } = useSelector((state) => state.user);
    const { editProfile } = useSelector((state) => state.ui);

    const [openProfilePicBtn, setProfilePicBtn] = useState(false);
    const [profilePic, setProfilePic] = useState(otherUserInfo.avatar ? otherUserInfo.avatar : defaultProfilePic);
    const profilePicBtnRef = useRef();

    useEffect(() => {
      return () => {
        if (editProfile) {
          dispatch(exitEditingProfile());
          dispatch(setAboutBio(userInfo.aboutBio));
        }
      }
    }, [location.pathname]); 

    useEffect(() => {
        if (openProfilePicBtn){
          const handleButtons = (e) => {
            if (!profilePicBtnRef.current.contains(e.target)){
              setProfilePicBtn(false);
            }
          }
      
          document.addEventListener("mousedown", handleButtons);
    
          return () => {
            document.removeEventListener("mousedown", handleButtons);
          }
        }
    }, [openProfilePicBtn])

    const handleProfilePicture = (file, preview) => {
      setProfilePic(preview);
      setUploadedFile(file);
      setProfilePicBtn(false);
    }

    const removeProfilePicture = () => {
      setProfilePic(defaultProfilePic);
      setUploadedFile("default");
      setProfilePicBtn(false);
    }

    const handleCancel = () => {
      setProfilePic(userInfo.avatar ? userInfo.avatar : defaultProfilePic);
      setUploadedFile(null);
      dispatch(setAboutBio(userInfo.aboutBio));
      dispatch(exitEditingProfile());
    }

    const handleEditProfileBtn = () => {
      dispatch(startEditingProfile());
    }

    return (
      <div className="profileAvatar-container">
          <div className="cover">
              <div className="cover-left-part">
                <div className="cover-details">
                    <div style={{position: "relative"}} ref={profilePicBtnRef}>
                      <Link to={`/profile/${otherUserInfo.slug}`}>
                        <img className="cover-profile-img" 
                            src={profilePic} 
                            alt="Profile photo" 
                            onError={(e) => {e.currentTarget.src = defaultProfilePic}}
                        />
                      </Link>
                      {editProfile &&
                        <button className={`btn profile-upload-btn ${loading ? "disabled-btn" : ""}`} 
                                onClick={() => setProfilePicBtn(!openProfilePicBtn)}
                                disabled={loading}
                        >
                          <EditIcon fontSize="small"/>
                        </button>
                      }
                      {openProfilePicBtn &&
                        <div className="profile-btn-pop-up">
                          <UploadImage onUpload={handleProfilePicture}
                                      onRemove={removeProfilePicture}
                                      uploadbtnText="Add photo" 
                                      uploadBtnStyle="add-photo"
                                      removeBtnText="Remove photo"
                                      removeBtnStyle="remove-photo"
                          />
                        </div>
                      }
                    </div>
                    <div className="cover-details-inside">
                        <Link to={`/profile/${otherUserInfo.slug}`}>
                            <h1 style={{marginTop: !editProfile ? "0px" : ""}}>{otherUserInfo.firstName + " " + otherUserInfo.lastName}</h1>
                        </Link>
                        {editProfile &&
                            <div className="cover-visit-settings">
                              <p>
                                  To change your name, visit <br />
                                  <Link className="cover-settings-btn" 
                                      to="/settings"
                                  >
                                      Account settings
                                  </Link>
                              </p>
                            </div>
                        }
                    </div>
                </div>
              </div>
              
              {userInfo._id === otherUserInfo._id &&
                <div className="cover-right-part">
                  {editProfile ? 
                    <div className="cover-right-btns">
                        <button className={`btn cover-btn c-cancel-btn ${loading || onLoading ? "disabled-btn" : ""}`}
                              onClick={handleCancel}
                              disabled={loading || onLoading}
                              >
                          Cancel
                        </button>
                        <button className={`btn cover-btn c-save-btn ${loading || onLoading ? "disabled-btn" : ""}`} 
                              onClick={onSave}
                              disabled={loading || onLoading}>
                          {loading || onLoading ? <CircularProgress size="20px" className="cover-btn-loader"/> : "Save"}
                        </button>
                    </div>
                    :
                    <button className="btn cover-edit-profile-btn" 
                          onClick={handleEditProfileBtn} 
                          >
                        <EditIcon className="edit-cover-btn-icon"/>
                        Edit profile
                    </button>
                  }
                </div>
              }
          </div>
      </div>
    )
}

export default ProfileAvatar;