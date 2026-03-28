import { Link } from "react-router-dom";
import { capitalizeFirstLetter, timeAgo } from "../../utils/helper";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import "./orderItems.css";

const OrderItems = ({items, loading, handleDeleteOrder}) => {
    return (
      <>
        {items.map(order => (
            <div className="orderContainer" key={order._id}>
                <div className="order-status-time">
                    <h4>Ordered: {timeAgo(order.createdAt)}</h4>
                    <h4>Status: <span className={`${order.status}-status`}>
                                    {capitalizeFirstLetter(order.status)}
                                </span>
                    </h4>
                </div>
                <hr />
                <div className="order-details-wrapper">
                    {order.payment.provider !== "internal" ?
                            <h3>{capitalizeFirstLetter(order?.type)}</h3>
                        :
                        <div className="order-items-images">
                            {order.items.map((item, index) => {
                                if (index < 5){
                                    return (
                                    <div className="image-quantity-detail" key={item.product?._id || index}>
                                        <img className="order-product-img" 
                                            src={item.product?.image || defaultProductPicture} 
                                            alt="Product image" 
                                            onError={(e) => {e.currentTarget.src = defaultProductPicture}} />
                                        <span className="order-product-quantity">{item.quantity}</span>
                                    </div>
                                    )
                                }
                            })}
                        </div>
                    }
                    <div className="order-amount">
                        <div className="order-btns">
                            <Link className="btn" to={`/order/${order._id}`}>
                                View order <ArrowRightAltIcon />
                            </Link>
                            <button className={`delete-order-btn ${loading ? "disabled-btn" : ""}`} disabled={loading} onClick={() => handleDeleteOrder(order._id)}>
                                Delete order
                            </button>
                        </div>
                        <h4>Total amount: <span>${(order.totalAmount / 100).toFixed(2)}</span></h4>
                    </div>
                </div>
            </div>
        ))}
      </>
    )
}

export default OrderItems;