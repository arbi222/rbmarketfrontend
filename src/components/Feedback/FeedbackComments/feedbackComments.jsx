import "./feedbackComments.css";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPageNumbers, timeAgo } from "../../../utils/helper";
import { CircularProgress } from "@mui/material";
import { resetSingleProduct } from "../../../redux/features/productSlice";
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef } from "react";
import HoverMenu from "../../HoverMenu/hoverMenu";

const FeedbackComments = ({feedbacks, currentPage, setCurrentPage, handleReviewSettings, updateReviewId,
                  activeSettingReviewId, setActiveSettingReviewId, firstCommentRef, scrollToFirstComment, profile}) => {

    const isFirstRender = useRef(true);

    const reviewSettingItems = [
      { 
        _id: 1,
        text: "Edit",
        icon: <EditIcon />
      },
      { 
        _id: 2,
        text: "Delete",
        icon: <DeleteIcon />
      },
    ]

    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { userInfo } = useSelector((state) => state.user);
    const { totalPages, totalReviews, isFetchingChecked, loading } = useSelector((state) => state.review);

    const reviewSettingMenuRef = useRef(null);

    useEffect(() => {
      if (!activeSettingReviewId) return;

      const handleClickOutside = (e) => {
        if (reviewSettingMenuRef.current && !reviewSettingMenuRef.current.contains(e.target)) {
          setActiveSettingReviewId(null);
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeSettingReviewId]);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
    
      if (!profile) {
        scrollToFirstComment();
      }
    }, [currentPage, profile]);

    if (!isFetchingChecked || loading) {
        return (
          <div className='reviews-loading'>
            <CircularProgress size={40} thickness={5} />
          </div>
        )
    }

    if (feedbacks?.length === 0){
      return (
        <div className={`no-feedback ${profile ? "profile-no-feedback" : ""}`}>
          <h1>There are no reviews yet!</h1>
        </div>
      )
    }
    
    return (
      <>
        <div className="feedback-container" ref={firstCommentRef}>
            <h3 className="feedback-header">REVIEWS <span>({totalReviews})</span></h3>
            {profile && <h3 className="product-header">PRODUCT</h3>}
            <h3 className="from-header">FROM</h3>
            <h3 className="when-header">WHEN</h3>
            {!profile && isAuthenticated ?
              <h3 className="settings-header">
                <SettingsIcon style={{marginTop: "-2px"}}/>
              </h3>
              :
              <div className="blank-space"></div>
            }
        </div>
        <hr className="hr feedback-hr"/>

        <div className="feedback-comments">
            {feedbacks?.map((feedback) => (
                <div key={feedback._id}>
                    <div className="comment">
                        <div className="feedback-comments-child">
                            {feedback.vote === "Positive" 
                                ? 
                                <span className="thumb-up">
                                  <ThumbUpIcon fontSize="small" /> 
                                </span>
                                :
                                <span className="thumb-down">
                                  <ThumbDownIcon fontSize="small"/> 
                                </span> 
                            }
                            <p>{feedback.comment} {feedback.createdAt !== feedback.updatedAt && <span className="edited-span">(Edited {timeAgo(feedback.updatedAt)})</span>}</p>
                        </div>
                        {profile && 
                          <div className="feedback-product">
                            <Link to={`/item/${feedback.product.slug}`} onClick={() => dispatch(resetSingleProduct())}>{feedback.product.title}</Link>
                          </div>
                        }
                        <div className="feedback-writer">
                            {feedback.user ? 
                              <Link to={`/profile/${feedback.user.slug}`}>{feedback.user.firstName + " " + feedback.user.lastName}</Link>
                              :
                              <p>Deleted User</p>
                            }
                        </div>
                        <div className="feedback-writer-time">
                            <p>{timeAgo(feedback.createdAt)}</p>
                        </div>
                        {!profile && feedback.user && (userInfo._id === feedback.user?._id) ?
                          <div className="feedback-settings" ref={activeSettingReviewId === feedback._id ? reviewSettingMenuRef : null}>
                              <button className={`btn feedback-settings-btn ${updateReviewId ? "disabled-btn" : ""}`}
                                    disabled={updateReviewId} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSettingReviewId(activeSettingReviewId === feedback._id ? null : feedback._id);
                                    }}>
                                <MoreVertIcon /> 
                              </button>
                              {activeSettingReviewId === feedback._id && 
                                <HoverMenu menu="reviewSettings" 
                                          items={reviewSettingItems} 
                                          onClickItem={handleReviewSettings}
                                />
                              }
                          </div>
                          :
                          <div className="blank-space"></div>
                        }
                    </div>
                    <hr className="hr comment-hr"/>
                </div> 
            ))}
        </div>
            
        {totalPages > 1 &&
          <div className="feedback-pagination">
              <button
                className="btn f-prev-btn" 
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
                  className={currentPage === num ? "active number-btn" : "number-btn"}
                >
                  {num}
                </button>
              ))}

              <button
                className="btn f-next-btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ArrowForwardIcon fontSize="small" style={{marginTop: "3px"}}/>
              </button>
          </div>
        }
      </>
    )
}

export default FeedbackComments;