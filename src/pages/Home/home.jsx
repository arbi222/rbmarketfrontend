import "./home.css";
import Navbar from "../../components/Navbar/navbar"
import ProductCard from '../../components/ProductCard/productCard';
import Jumbotron from "../../components/Jumbotron/jumbotron";
import Brands from "../../components/Brands/brands";
import Footer from "../../components/Footer/footer";
import PageTitle from "../../components/PageTitle/pageTitle";
import { CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllCategories } from "../../redux/features/categorySlice";
import { getTopBrands } from "../../redux/features/brandSlice";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";

const Home = () => {

  const dispatch = useDispatch();
  const {categories, loading: categoriesLoading} = useSelector((state) => state.category);
  const {topBrands, loading: brandsLoading} = useSelector((state) => state.brand);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getTopBrands());
  }, [dispatch]);

  if (categoriesLoading || brandsLoading){
    return (
      <div className='auth-loading-screen'>
        <CircularProgress size={40} thickness={5} />
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-page-container">
        <PageTitle title="Homepage | RB Market" />
        <PayMethodAction from={"/checkout?"}/>
        <Navbar usage="home" />
        {categories.length > 0 &&
          <ProductCard />
        }
        <div style={{marginTop : categories.length < 1 ? "30px" : "0px"}}>
          <Jumbotron usage="home" />
        </div>
        {topBrands.length > 0 &&
          <Brands />
        }
      </div>

      <Footer usage="home" />
    </div>
    
  )
}

export default Home;