import "./sellerBanner.css";
import sellerbanner from "../../../public/sellerbanner.jpg";
import sellerEndingbanner from "../../../public/endingBanner.jpeg";
import { Link } from "react-router-dom";

const SellerBanner = ({usage}) => {

    const isHeader = usage === "header";
    const isEnding = usage === "ending";

    return (
      <div className="seller-banner-wrapper">
        <img src={isHeader ? sellerbanner : sellerEndingbanner} alt="Selling Banner" />
        <div className={`seller-headline ${isEnding && "ending-header"}`}>
            {isHeader ?
              <h1>Make money selling on <span className="rb">RB</span> <span className="market">Market</span></h1>
            :
              <h1>You've got this. We've got your back.</h1>
            }
            {isHeader && <p>Sell your items fast — millions of buyers are waiting.</p>}
            <Link to="/list-item">List an item</Link>
        </div>
      </div>
    )
}

export default SellerBanner;