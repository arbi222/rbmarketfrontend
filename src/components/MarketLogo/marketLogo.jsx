import "./marketLogo.css";
import logo from "../../../public/assets/logo.png";
import { Link } from "react-router-dom";

const MarketLogo = ({navbar}) => {
  return (
    <Link className="marketLogo" to="/">
        <img className={navbar ? "navbar-usage" : ""} src={logo} alt="Market Logo" />
    </Link>
  )
}

export default MarketLogo;