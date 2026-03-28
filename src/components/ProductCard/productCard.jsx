import { useEffect, useRef, useState, useMemo } from "react";
import "./productCard.css";
import defaultProductPicture from "../../../public/assets/defaultProduct.png";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const ProductCard = () => {

    const { categories } = useSelector((state) => state.category);
    const { userInfo } = useSelector((state) => state.user);

    const filteredCategories = useMemo(() => {
      return categories?.filter((category) => category.name !== "Others") || []
    },
    [categories]);

    const [selectedCategory, setSelectedCategory] = useState(
      filteredCategories[0] || { _id: "", name: "", description: "", image: "#" }
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [hideSideBtns, setHide] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
      startCarousel();
      return () => stopCarousel();
    }, [filteredCategories]);

    const startCarousel = () => {
      stopCarousel();
      setHide(true);
      intervalRef.current = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCategories?.length);
          setFade(true);
        }, 500);
      }, 5000);
    };

    const stopCarousel = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setHide(false);
    };

    const nextSlide = () => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCategories?.length);
          setFade(true);
        }, 500);
    };

    const prevSlide = () => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredCategories?.length) % filteredCategories?.length);
          setFade(true);
        }, 500);
    };

    const goToSlide = (index) => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex(index);
          setFade(true);
        }, 500);
    };

    useEffect(() => {
      if (filteredCategories?.length !== 0){
        setSelectedCategory({
          _id: filteredCategories[currentIndex]._id,
          name: filteredCategories[currentIndex].name,
          description: filteredCategories[currentIndex].description,
          image: filteredCategories[currentIndex].image
        })
      }
    }, [filteredCategories, currentIndex])
    

  return (
    <div className='product-card' onMouseEnter={stopCarousel} onMouseLeave={startCarousel}>
        <div className={`product-card-fade ${fade ? "fade-in" : "fade-out"}`}>
            <img className="product-card-image" 
                src={selectedCategory.image || defaultProductPicture} 
                alt={selectedCategory.name || "Product"} 
                onError={(e) => {e.currentTarget.src = defaultProductPicture}} 
            />
            <div className='product-card-details'>
                <h1>{selectedCategory.name}</h1>
                <p>{selectedCategory.description}</p>
                <Link className="btn" to={"/shopping?category=" + encodeURIComponent(selectedCategory.name) + "&categoryId=" + selectedCategory._id + "&linkFetch=true"}>
                  {userInfo.isAdmin ? "Browse products" : "Shop now"}
                </Link>
            </div>
        </div>

        {!hideSideBtns && <>
            <button className="carousel-arrow left" onClick={prevSlide} title="Previous item">
              ‹
            </button>
            <button className="carousel-arrow right" onClick={nextSlide} title="Next item">
              ›
            </button>
          </>
        }
        <div className="carousel-dots">
          {filteredCategories?.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}>  
            </span>
          ))}
        </div>
    </div>
  )
}

export default ProductCard;