import Footer from "../Footer/footer";
import MarketLogo from "../MarketLogo/marketLogo";
import "./authLayout.css";

const AuthLayout = ({title, children}) => {
  return (
    <div className="login-container">
        <div className="market-logo">
            <MarketLogo />
        </div>

        <h2 className="login-header">{title}</h2>
        {children}
        
        <div className="footer-login">
            <Footer />
        </div>
    </div>
  )
}

export default AuthLayout;