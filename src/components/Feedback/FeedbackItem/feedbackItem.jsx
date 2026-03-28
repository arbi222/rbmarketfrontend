import React, { useEffect, useRef, useState } from 'react'
import "./feedbackItem.css";
import FeedbackComments from '../FeedbackComments/feedbackComments';
import FeedbackVoting from '../FeedbackVoting/feedbackVoting';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { checkForReview, createReview, deleteReview, getProductReviews, resetMessages, resetReviews, updateReview } from '../../../redux/features/reviewSlice';
import { closeGeneralPopUp, openGeneralPopUp } from '../../../redux/features/uiSlice';
import GeneralPopUp from '../../../popUps/GeneralPopUp/generalPopUp';
import { useLocation, useNavigate } from 'react-router-dom';

const FeedbackItem = () => {    

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { userInfo } = useSelector((state) => state.user);
    const generalPopUp = useSelector((state) => state.ui.generalPopUp);
    const { product } = useSelector((state) => state.product.singleProduct);
    const { reviews, page, loading, canReview, error, successMessage} = useSelector((state) => state.review);

    const [currentPage, setCurrentPage] = useState(page);

    const [comment, setComment] = useState("");
    const [vote, setVote] = useState(null);
    const [disableBtn, setDisableBtn] = useState(false);

    const [activeSettingReviewId, setActiveSettingReviewId] = useState(null);
    const [updateReviewId, setUpdateReview] = useState(null);
    const updateTextareaRef = useRef(null);
    const firstCommentRef = useRef(null);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const reviewForm = useRef(null);

    const scrollToTextarea = () => {
        const el = updateTextareaRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const isVisible =
          rect.top >= 0 &&
          rect.bottom <= window.innerHeight;

        if (!isVisible) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    const scrollToFirstComment = () => {
        const el = firstCommentRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const isVisible =
          rect.top >= 0 &&
          rect.bottom <= window.innerHeight;

        if (!isVisible) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    useEffect(() => {
        if (location.state?.scrollTo === "reviewForm" || location?.hash === "#reviewForm"){
            setTimeout(() => {  
                reviewForm.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 300);
        }
    }, [])

    useEffect(() => {
        setCurrentPage(1);                      
    }, [product]);

    useEffect(() => {
        dispatch(resetReviews());
        dispatch(getProductReviews({productId: product._id, page: currentPage}))
    }, [product, currentPage])

    const checkifCanReview = () => {
        dispatch(checkForReview({productId: product._id}));
    }

    useEffect(() => {
        if (!userInfo?._id) return;
        checkifCanReview();
    }, [userInfo])

    useEffect(() => {
      if (error){
        toast.error(error);
        dispatch(resetMessages());
      }
      if (successMessage){
        toast.success(successMessage);
        dispatch(resetMessages());
      }
    }, [error, successMessage])

    useEffect(() => {
        if (comment === "" || vote === null){
            setDisableBtn(true);
        }
        else{
            setDisableBtn(false);
        }
    }, [vote, comment])

    const handleReview = async (e) => {
        e.preventDefault();

        const requiredData = {
            comment,
            vote
        }

        try{
            if (updateReviewId){
                dispatch(resetMessages());
                requiredData.reviewId = updateReviewId;
                await dispatch(updateReview(requiredData)).unwrap();
                setComment("");
                setVote(null);
                setUpdateReview(null);
            }
            else{
                dispatch(resetMessages());
                requiredData.productId = product._id;
                await dispatch(createReview(requiredData)).unwrap();
                setComment("");
                setVote(null);
                checkifCanReview();
                if (currentPage === 1){
                    dispatch(resetReviews());
                    dispatch(getProductReviews({productId: product._id, page: 1}));
                }
                else{
                    setCurrentPage(1);
                }
                scrollToFirstComment();
            }
        }
        catch(err){
            console.error("Failed to create review: ", err.message);
        }
    }

    const handleReviewSettings = (id) => {
      if (id === 1){
        setUpdateReview(activeSettingReviewId);
        const currentReview = reviews.find((review) => review._id === activeSettingReviewId);
        if (!currentReview) return;
        setActiveSettingReviewId(null);
        setComment(currentReview.comment);
        setVote(currentReview.vote);
        scrollToTextarea();
      }
      else if (id === 2){
        setReviewToDelete(activeSettingReviewId);
        dispatch(openGeneralPopUp("YesNo"));
        setActiveSettingReviewId(null);
      }
      else{
        return;
      }
    }

    const handleCancelUpdate = () => {
        setComment("");
        setVote(null);
        setUpdateReview(null);
    }

    const handleCancelDelete = () => {
        dispatch(closeGeneralPopUp());
        setReviewToDelete(null);
    }

    const handleDeleteReview = async () => {
        if (deleting) return;
        setDeleting(true);
        try{
            await dispatch(deleteReview({reviewId: reviewToDelete})).unwrap();
            checkifCanReview();
            handleCancelDelete();

            if (currentPage === 1){
                dispatch(resetReviews());
                dispatch(getProductReviews({productId: product._id, page: 1}));
            }
            else{
                if (reviews.length > 1){
                    dispatch(resetReviews());
                    dispatch(getProductReviews({productId: product._id, page: currentPage}));
                }
                else{
                    const newPage = currentPage > 1 && reviews.length === 1 ? currentPage - 1 : currentPage;
                    setCurrentPage(newPage);
                }
            }
            scrollToFirstComment();
        }
        catch (err){
            console.error(err);
        }
        finally{
            setDeleting(false);
        }
    } 

    const signInReview = () => {
        navigate("/sign-in", {
            state: {
                from: location.pathname, 
                scrollTo: "reviewForm"
            }
        })
    }

    return (
      <div ref={reviewForm}>
        <FeedbackComments feedbacks={reviews} 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        handleReviewSettings={handleReviewSettings}
                        activeSettingReviewId={activeSettingReviewId} 
                        setActiveSettingReviewId={setActiveSettingReviewId}
                        updateReviewId={updateReviewId}
                        firstCommentRef={firstCommentRef}
                        scrollToFirstComment={scrollToFirstComment}
        />

        {generalPopUp === "YesNo" &&
            <GeneralPopUp usage="YesNo"
                        showLastBtns={false} 
                        closePopUp={handleCancelDelete}
                        content={() => (
                          <div className='popup-asking-delete'>
                            <h3>Delete review</h3>
                            <p>Are you sure you want to delete this review?</p>
                            <div className='YesNoBtns'>
                                <button disabled={deleting} className={deleting ? "disabled-btn" : ""} onClick={handleCancelDelete}>No</button>
                                <button disabled={deleting} className={deleting ? "disabled-btn" : ""} onClick={handleDeleteReview}>Yes</button>
                            </div>
                          </div>
                        )}
            />
        }

        {(userInfo._id !== product.seller._id) && !userInfo.isAdmin && (canReview || updateReviewId) && (
            isAuthenticated ?
                <form onSubmit={handleReview} className='review-form'>
                    <textarea value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            placeholder='Leave your review for this product...'
                            disabled={loading}
                            ref={updateTextareaRef}
                    />
                    <div className='voting-post'>
                        <FeedbackVoting vote={vote} setVote={setVote} disabled={loading}/>
                    </div>
                    <div className='review-btn-div'>
                        {updateReviewId && 
                            <button type='button' className='review-btn' disabled={loading} onClick={handleCancelUpdate}>
                                Cancel
                            </button>
                        }
                        <button type='submit' className='review-btn' disabled={disableBtn || loading}>
                            {updateReviewId ? "Update" : "Post"}
                        </button>
                    </div>
                </form>
                :
                <div className='sign-in-review'>
                    <p>
                        <button onClick={signInReview} to={`/sign-in?item=${product.slug}`}>
                            Sign in
                        </button>
                        to leave your review for this product.
                    </p>
                </div> 
            )
        }
      </div>
    )
}

export default FeedbackItem;