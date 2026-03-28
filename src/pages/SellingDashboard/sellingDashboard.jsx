import Jumbotron from "../../components/Jumbotron/jumbotron";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import SellerBanner from "../../components/SellerBanner/sellerBanner";
import "./sellingDashboard.css";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/pageTitle";

const SellingDashboard = () => {

    const learnSellingRef = useRef(null);
    
    const scrollToDetails = () => {
      learnSellingRef.current.scrollIntoView({behavior: "smooth"});
    }

    const [searchParams] = useSearchParams();
    const learnCondition = searchParams.get("learn");

    useEffect(() => {
        let time;
        if (learnCondition === "true"){
            time = setTimeout(() => {
              scrollToDetails();
            }, 750)
        }

        return () => {
          if (time){
            clearTimeout(time);
          }
        }
    }, [learnCondition])

    return (
      <div className="selling-dashboard-page">
        <PageTitle title="Start Selling | RB Market" />
        <Navbar usage="home" />

        <SellerBanner usage="header"/>

        <Jumbotron usage="selling" learnSelling={learnSellingRef}/>

        <Jumbotron usage="howtosell" />

        <SellerBanner usage="ending"/>

        <Footer usage="home"/>
      </div>
    )
}

export default SellingDashboard;