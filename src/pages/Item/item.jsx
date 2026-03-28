import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import SingleItem from "../../components/SingleItem/singleItem";
import "./item.css";
import { useEffect, useRef } from "react";
import ItemSpecifications from "../../components/itemSpecifications/itemSpecifications";
import Footer from "../../components/Footer/footer";
import AboutSeller from "../../components/AboutSeller/aboutSeller";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProduct, resetSingleProduct } from "../../redux/features/productSlice";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import FeedbackItem from "../../components/Feedback/FeedbackItem/feedbackItem";
import { resetReviews } from "../../redux/features/reviewSlice";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Item = () => {

    const {itemSlug} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isFetchingChecked, successMessage, error, product } = useSelector((state) => state.product.singleProduct);

    const readMoreRef = useRef(null);

    const scrollToDetails = () => {
      readMoreRef.current.scrollIntoView({behavior: "smooth"});
    }

    useEffect(() => {
      dispatch(resetSingleProduct());
      dispatch(resetReviews());
      dispatch(getSingleProduct({slug: itemSlug}));
    }, [itemSlug]);

    useEffect(() => {
      if (error) toast.error(error);
      if (successMessage) toast.success(successMessage);
    }, [error, successMessage]);

    useEffect(() => {
      if (error){
        navigate("/");
      }
    }, [error])

    if (!isFetchingChecked || product === null) {
      return (
        <div className='auth-loading-screen'>
          <CircularProgress size={40} thickness={5} />
        </div>
      )
    }

    return (
      <div className="item-page">
        <PageTitle title="View Item | RB Market" />
        <PayMethodAction from={`/item/${itemSlug}?`}/>
        <Navbar usage="item" />

        <SingleItem onReadMore={scrollToDetails} />

        <ItemSpecifications readMoreRef={readMoreRef}/>

        <div className="seller-container">
          <AboutSeller />
          <div className="feedback-seller">
            <FeedbackItem />
          </div>
        </div>
        
        <Footer />
      </div>
    )
}

export default Item;