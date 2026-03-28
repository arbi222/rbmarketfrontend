import "./brands.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";

const Brands = () => {

    const { topBrands } = useSelector((state) => state.brand);

    if (topBrands?.length === 0) return;

    return (
    <div className="brands-container">
        <h2>Best-selling brands on RB Market</h2>

        <div className="brands-photos" >
            {topBrands.map((brand) => {
                if (brand.name === "Unbranded") return null;

                return (
                    <Link to={"/shopping?brand=" + encodeURIComponent(brand.name) + "&brandId=" + brand._id} key={brand._id} className="brand-item">
                        <div className="brand-item-img">
                            <img className="brand-image" 
                                src={brand.image || defaultProductPicture} 
                                alt={brand.name || "Brand"} 
                                onError={(e) => {e.currentTarget.src = defaultProductPicture}}
                            />
                        </div>
                        <h4>{brand.name}</h4>
                    </Link>
                )
            })}
        </div>
    </div>
  )
}

export default Brands;