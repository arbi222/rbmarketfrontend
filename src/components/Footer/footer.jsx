import "./footer.css";
import { Link } from "react-router-dom";
import ProtectedLink from "../ProtectedLink/protectedLink";

const Footer = ({usage}) => {

  const year = new Date().getFullYear();

  return (
    <div className={`footer-container-${usage}`}>

        <div className="footer-items">
            <div className="footer-section">
                <h5>Marketplace</h5>
                <Link to="/shopping">Browse Items</Link>
                <ProtectedLink to="/selling" children={"Start selling"} state={{from: "/selling"}}/>
            </div>

            <div className="footer-section">
                <h5>Legal</h5>
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
            </div>

            <div className="footer-section">
                <h5>Support</h5>
                <ProtectedLink to="/selling?learn=true" children={"How to sell"} state={{from: "/selling?learn=true"}}/> 
                <Link to={`mailto:${import.meta.env.VITE_PLATFORM_EMAIL}`}>Contact Us</Link>
            </div>
        </div>
        
        <div className="footer-rights">
            <p>Copyright © {year} RB Market Inc. All Rights Reserved.</p>
        </div>
    </div>
  )
}

export default Footer;