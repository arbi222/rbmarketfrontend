import { useState } from "react";
import "./itemSpecifications.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatedDate } from "../../utils/helper";

const ItemSpecifications = ({readMoreRef}) => {

    const { product } = useSelector((state) => state.product.singleProduct);
    const [seeMoreBtn, setSeeMoreBtn] = useState(product.description.length > 400);

    return (
      <div className="item-specifications-container" ref={readMoreRef}>
        <div className="item-sp-title">
            About this item
        </div>

        <div className="item-sp-inside">
            <div className="pre-info">
                <div>
                    <p>Seller assumes all responsibility for this listing.</p>
                    <p>Listing time: <span>{formatedDate(product.createdAt)}</span></p>
                </div>
                <p className="item-id">RB Market item id: <span>{product.slug}</span></p>
            </div>

            <div className="item-specifics">
                <h2>Item specifics</h2>
                <div className="specific">
                    <p>Condition:</p>
                    <span>{product.condition}</span>
                </div>
                {product.brand && product.brand.name !== "Unbranded" &&
                    <div className="specific">
                        <p>Brand:</p>
                        <Link to={"/shopping?brand=" + encodeURIComponent(product.brand?.name) + "&brandId=" + product.brand?._id}>{product.brand?.name}</Link>
                    </div>
                }
                {product.category &&
                    <div className="specific">
                        <p>Category:</p>
                        <Link to={"/shopping?category=" + encodeURIComponent(product.category?.name) + "&categoryId=" + product.category?._id}>{product.category?.name}</Link>
                    </div>
                }
            </div>

            <div className="item-description">
                <h2>Item description from the seller</h2>
                <p>{seeMoreBtn ? product.description?.slice(0, 400) + " ..." : product?.description}</p>
                {product.description?.length > 400 &&
                    <button className="see-more-less-btn" onClick={() => setSeeMoreBtn(!seeMoreBtn)}>
                        {seeMoreBtn ? "See more" : "See less"}
                    </button>
                }
            </div>
        </div>
      </div>
    )
}

export default ItemSpecifications;