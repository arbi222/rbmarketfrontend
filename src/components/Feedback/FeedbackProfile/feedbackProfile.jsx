import "./feedbackProfile.css";
import FeedbackVoting from "../FeedbackVoting/feedbackVoting";
import FeedbackComments from "../FeedbackComments/feedbackComments";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";

const FeedbackProfile = ({currentPage, setCurrentPage}) => { 

    const {reviews, error} = useSelector((state) => state.review);

    useEffect(() => {
      if (error){
        toast.error(error);
      }
    }, [error])

    return (
      <>
        <h2 className="feedback-container-header">Feedback ratings</h2>
        <FeedbackVoting profile={true}/>
        <FeedbackComments feedbacks={reviews} currentPage={currentPage} setCurrentPage={setCurrentPage} profile={true}/>
      </>
    )
}

export default FeedbackProfile;