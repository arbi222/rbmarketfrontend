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
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [hideSideBtns, setHide] = useState(true);
    const intervalRef = useRef(null);
    
    const selectedCategory = filteredCategories[currentIndex] || { _id: "", name: "", description: "", image: "#" }

    useEffect(() => {
      filteredCategories.forEach((cat) => {
        const img = new Image();
        img.src = cat.image;
      });
    }, [filteredCategories])

    useEffect(() => {
      startCarousel();
      return () => stopCarousel();
    }, [filteredCategories]);

    const startCarousel = () => {
      stopCarousel();
      setHide(true);
      
      intervalRef.current = setInterval(() => {
        changeSlide((prev) => (prev + 1) % filteredCategories.length);
      }, 5000);
    };

    const stopCarousel = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setHide(false);
    };

    const changeSlide = (newIndexFn) => {
      setFade(false);
      setCurrentIndex(newIndexFn);
      setTimeout(() => {
        setFade(true);
      }, 500);
    }

    const nextSlide = () => {
      changeSlide((prev) => (prev + 1) % filteredCategories.length);
    };

    const prevSlide = () => {
      changeSlide((prev) => (prev - 1 + filteredCategories.length) % filteredCategories.length);
    };

    const goToSlide = (index) => {
      changeSlide(() => index);
    };
    
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