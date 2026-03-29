import { Link } from "react-router-dom";
import "./jumbotron.css";
import { useSelector } from "react-redux";

const Jumbotron = ({usage, learnSelling}) => {

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const isHome = usage === "home";
    const isSelling = usage === "selling";
    const isHowtoSell = usage === "howtosell";

    if (isHome){
      return (
        <div className={`jumbotron j-${usage}`}>
            <div className={`${isAuthenticated ? "j-left-part" : "j-left-part-auth"}`}>
              <div>
                  <h1>Shopping made easy</h1>
                  <p>Shop with confidence – fast delivery and secure checkout.</p>
              </div>
              <Link className="j-start-btn" to="/shopping">{isAuthenticated ? "Browse products" : "Start now"}</Link>
            </div>

            {isAuthenticated &&  
              <div className="j-right-part">
                  <h1>Are you a seller?</h1>
                  <p>Reach thousands of customers and grow your business with ease.</p>
                  <Link className="j-join-btn" to="/selling">Go to Seller Dashboard</Link>
              </div>
            }
        </div>
      )
    }

    if (isSelling){
      return (
        <div className={`j-${usage}`} ref={learnSelling}>
          <h1>Reach millions of trusted buyers on RB Market</h1>
          <div className="j-paragraphs">
            <div>
              <h2>Quick listing</h2>
              <p>Create a listing in just a few clicks and make your first sale today. Only pay a final value fee when your item sells.</p>
            </div>
            <div>
              <h2>Secure payments</h2>
              <p>All transactions are protected to keep your money safe. Experience fast and reliable payments backed by strong security.</p>
            </div>
          </div>
        </div>
      )
    }


    if (isHowtoSell){
      return (
        <div className={`j-${usage}`}>
          <h1>Create a great listing</h1>
          <p className="underheader-p">Here are three ways to set yourself up for success.</p>
          <div className="j-paragraph">
            <div>
              <h2>Create a title that sells</h2>
              <p>Keep it clear and specific with details like brand, model, size, and color.</p>
            </div>
            <div>
              <h2>Take high-quality photos</h2>
              <p>Good photos attract more buyers! Take clear, well-lit pictures, and make sure key details like labels or tags are visible.</p>
            </div>
            <div>
              <h2>Set the right price</h2>
              <p>Research similar listings to understand the market value. Price your item fairly — not too high to scare buyers away, but not too low to lose profit.</p>
            </div>
          </div>
        </div>
      )
    }
    
}

export default Jumbotron;