import { useEffect, useState } from "react";
import "./about.css";
import { useDispatch, useSelector } from "react-redux";
import { setAboutBio } from "../../redux/features/uiSlice";
import { formatedDate } from "../../utils/helper";

const About = () => {

    const dispatch = useDispatch();
    const { userInfo, otherUserInfo, loading } = useSelector((state) => state.user);
    const { editProfile, aboutBio } = useSelector((state) => state.ui);

    const user = userInfo._id === otherUserInfo._id ? userInfo : otherUserInfo;

    const [seeMoreBtn, setSeeMoreBtn] = useState(otherUserInfo.aboutBio.length > 200);

    useEffect(() => {
      dispatch(setAboutBio(userInfo.aboutBio));
    }, [dispatch])

    return (
      <>
          <h2 className="about-header">About</h2>

          {!editProfile && 
            <div className="description-container">
              <p className="description">{seeMoreBtn ? user.aboutBio.slice(0, 200) + " ..." : user.aboutBio}</p>
              {user.aboutBio.length > 200 &&
                <button className="see-more-less-btn" onClick={() => setSeeMoreBtn(!seeMoreBtn)}>
                    {seeMoreBtn ? "See more" : "See less"}
                </button>
              }
            </div>
          }

          {editProfile &&
              <div className="textarea-div">
                  <textarea value={aboutBio}
                          onChange={(e) => dispatch(setAboutBio(e.target.value))}
                          className="about-textarea"
                          placeholder="Use this space to tell other RB Market members about yourself and what you’re passionate about."
                          maxLength="1000"
                          rows="4"
                          disabled={loading}
                  />
                  <span className="textarea-counter">{aboutBio.length}/1000</span>
              </div>  
          }

          <div className="static-about-info">
              {user.country &&
                <div className="static-info-child">
                    <span>Location:</span>
                    <p>Albania</p>
                </div>
              }
              <div className="static-info-child">
                  <span>Member since:</span>
                  <p>{formatedDate(user.createdAt)}</p>
              </div>
          </div>
      </>
    )
}

export default About;