import { useState } from "react";
import "./aboutSeller.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfilePic from "../../../public/assets/defaultPerson.jpg";
import { formatedDate } from "../../utils/helper";
import ProtectedLink from "../ProtectedLink/protectedLink";

const AboutSeller = () => {

    const { userInfo } = useSelector((state) => state.user);
    const { product } = useSelector((state) => state.product.singleProduct);
    const [seeMoreBtn, setSeeMoreBtn] = useState(product.seller.aboutBio.length > 200);

    const totalReviews = product.seller.feedbackPositive + product.seller.feedbackNegative;
    let reviewPositivePercentage = 0;
    if (totalReviews > 0){
        reviewPositivePercentage = ((product.seller.feedbackPositive / totalReviews) * 100).toFixed(2);
    }

    return (
      <div className="about-seller-container">
        <h2 className="about-seller-header">About this seller</h2>

        <div className="seller-main-info">
            <ProtectedLink to={`/profile/${product.seller.slug}`} 
                        children={
                            <img src={product.seller.avatar || defaultProfilePic} alt="seller-image" onError={(e) => {e.currentTarget.src = defaultProfilePic}} />
                        } 
                        state={{from: `/profile/${product.seller.slug}`}}
            />
            <div className="seller-name">
                <ProtectedLink to={`/profile/${product.seller.slug}`} 
                            children={
                                userInfo._id === product.seller._id ?
                                    "(You)"
                                    :
                                    product.seller.firstName + " " + product.seller.lastName
                            } 
                            state={{from: `/profile/${product.seller.slug}`}}
                />
                {reviewPositivePercentage >= 0 ? 
                    <p>{reviewPositivePercentage}% positive <span>({totalReviews})</span></p>
                    :
                    <p>No reviews yet.</p>
                }
            </div>
        </div>

        <div className="seller-description">
            <p className="seller-timestamp">Joined: <span>{formatedDate(product.seller.createdAt)}</span></p>

            {product.seller.aboutBio && 
                <p className="seller-description-p">
                    {seeMoreBtn ? product.seller.aboutBio.slice(0, 200) + " ..." : product.seller.aboutBio}
                </p>
            }
            {product.seller.aboutBio.length > 200 &&
                <button className="see-more-less-btn" onClick={() => setSeeMoreBtn(!seeMoreBtn)}>
                    {seeMoreBtn ? "See more" : "See less"}
                </button>
            }
        </div>

        <div className="visit-store">
            <Link to={`/profile/${product.seller.slug}`}>Visit store</Link>
        </div>
        
        {product.sellerCategories.length > 0 &&
            <div className="sellers-categories">
                <h3>Categories from this store</h3>

                {product.sellerCategories?.map((category) => (
                    <div className="category-seller" key={category._id}>
                        <Link to={`/profile/${product.seller.slug}?category=${encodeURIComponent(category.name)}&categoryId=${category._id}`}>
                            {category.name}
                        </Link>
                    </div>
                ))}
            </div>
        }
      </div>
    )
}

export default AboutSeller;