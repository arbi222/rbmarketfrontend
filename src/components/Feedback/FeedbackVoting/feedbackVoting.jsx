import "./feedbackVoting.css";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useSelector } from "react-redux";

const FeedbackVoting = ({vote, setVote, disabled, profile}) => {

    const { otherUserInfo } = useSelector((state) => state.user);

    const totalReviews = otherUserInfo?.feedbackPositive + otherUserInfo?.feedbackNegative;
    let reviewPositivePercentage = 0;
    if (totalReviews > 0){
        reviewPositivePercentage = ((otherUserInfo?.feedbackPositive / totalReviews) * 100).toFixed(2);
    }

    return (
      <div className="feedback-ratings">
            <div className="rating-child">
                <p>Positive</p>
                <div className="feedback-thumb">
                    {!profile &&
                        <button className={`btn ${vote === "Positive" ? "btn-positive" : ""} ${disabled ? "disabled-btn" : ""}`}
                                type="button" 
                                onClick={() => setVote("Positive")}
                                disabled={disabled}>
                            <ThumbUpIcon style={{marginTop: "3px"}}/>    
                        </button>
                    }  
                    {profile && <span>{otherUserInfo.feedbackPositive || 0}</span>}
                </div>
            </div>
            <div className="rating-child">
                <p>Negative</p>
                <div className="feedback-thumb">
                    {!profile &&
                        <button className={`btn ${vote === "Negative" ? "btn-negative" : ""} ${disabled ? "disabled-btn" : ""}`}
                                type="button" 
                                onClick={() => setVote("Negative")}
                                disabled={disabled}>
                            <ThumbDownIcon style={{marginTop: "3px"}}/>    
                        </button>
                    }
                    {profile && <span>{otherUserInfo.feedbackNegative || 0}</span>}
                </div>
            </div>
            {profile &&
                <div className="rating-child">
                    <p>Percentage</p>
                    <div className="feedback-thumb">
                        <span>{reviewPositivePercentage}%</span>
                    </div>
                </div>
            }
        </div>
    )
}

export default FeedbackVoting;