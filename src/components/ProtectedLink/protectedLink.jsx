import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedLink = ({to, children, state, style}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();

      navigate("/sign-in", {
        state: state
      });
    }
  };

  return (
    <Link to={to} onClick={handleClick} className={style}>
      {children}
    </Link>
  );
};

export default ProtectedLink;
