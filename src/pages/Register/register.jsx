import { useEffect, useState } from "react";
import AuthLayout from "../../components/AuthLayout/authLayout";
import { CircularProgress } from '@mui/material';
import "./register.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InputAuthField from "../../components/InputAuthField/inputAuthField";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from "../../redux/features/authSlice";
import googleIcon from "../../../public/assets/google.png";
import { toast } from "react-toastify";
import { redirectAfterLogin } from "../../utils/helper";
import PageTitle from "../../components/PageTitle/pageTitle";

const Register = () => {
    
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { error, loading } = useSelector((state) => state.auth);

    const [registerValues, setRegisterValues] = useState({firstName: "", lastName: "", email: "", password: "", confirmPassword: ""});
    const [errorPasswords, setErrorPasswords] = useState(false);

    useEffect(() => {
        if (error) {
            toast.error(error);
        } 
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorPasswords(false);

        if (registerValues.password !== registerValues.confirmPassword){
            setErrorPasswords(true);
            return;
        }

        try{
            await dispatch(registerUser(registerValues)).unwrap();
            redirectAfterLogin(navigate, location);
        }
        catch(err){
            console.error(err);
        }
    }

    const handleGoogleLogin = () => {
        const redirectState = {
          from: location.state?.from || "/",
          scrollTo: location.state?.scrollTo || "",
          cartPopUp: location.state?.cartPopUp || false,
          notificationPopUp: location.state?.notificationPopUp || false,
        };
        
        sessionStorage.setItem(
          "postAuthRedirect",
          JSON.stringify(redirectState)
        );

        window.location.href = `${import.meta.env.VITE_BACKEND_URL_API}/auth/google`; 
    }

    return (
      <>
        <PageTitle title="Register | RB Market" />
        <AuthLayout title="Create an account"> 
            <p className="register-p-tag">
                Already have an account?
                <Link to="/sign-in">
                  <button type="button"
                        className={loading ? "disabled-btn" : ""} 
                        disabled={loading}
                  >
                    Sign in
                  </button>
                </Link>
            </p>

            <div className="register-form-container">
                  <form onSubmit={handleSubmit}>
                      <div className="register-username">
                          <InputAuthField
                              label="First name" 
                              id="name"
                              required={true}
                              autofocus={true}
                              disabled={loading}
                              value={registerValues.firstName}
                              onChange={(e) => setRegisterValues(prev => ({...prev, firstName: e.target.value}))}
                          />

                          <InputAuthField
                              label="Last name" 
                              id="lastName"
                              disabled={loading}
                              value={registerValues.lastName}
                              onChange={(e) => setRegisterValues(prev => ({...prev, lastName: e.target.value}))}
                          />
                      </div>

                      <div className="register-other-fields">
                          <InputAuthField
                              label="Email" 
                              type='email'
                              id="email"
                              required={true}
                              disabled={loading}
                              value={registerValues.email}
                              onChange={(e) => setRegisterValues(prev => ({...prev, email: e.target.value}))}
                          />

                          <InputAuthField
                              label="Password" 
                              type='password'
                              id="password"
                              required={true}
                              minLength="8"
                              disabled={loading}
                              value={registerValues.password}
                              onChange={(e) => setRegisterValues(prev => ({...prev, password: e.target.value}))}
                          />

                          <InputAuthField
                              label="Confirm Password" 
                              type='password'
                              id="confirmPassword"
                              required={true}
                              minLength="8"
                              disabled={loading}
                              value={registerValues.confirmPassword}
                              onChange={(e) => setRegisterValues(prev => ({...prev, confirmPassword: e.target.value}))}
                          />
                      </div>

                      {errorPasswords &&
                          <div className="error-password-mismatch">
                              <p>Password and Confirm password do not match.</p>
                          </div>
                      }

                      <div className="settings-btns sign-in-btn-section">
                          <button type="submit" 
                                  className={`save-settings ${loading ? "disabled-btn" : ""}`} 
                                  disabled={loading}>
                              {loading ? 
                                  <CircularProgress className="circular-loader-sign-in" size="25px" thickness="6"/> 
                              : 
                                  "Sign up"
                              }
                          </button>
                      </div>
                  </form>
                            
                  <div className="divider">
                      <span className="divider-text">or</span>
                  </div>

                  <div className="settings-btns sign-in-btn-section">
                      <button type="button" 
                              className={`save-settings google-btn-login ${loading ? "disabled-btn" : ""}`} 
                              disabled={loading}
                              onClick={handleGoogleLogin}
                      >
                          <img src={googleIcon} alt="google" />
                          <span>Continue with Google</span>
                      </button>
                  </div>
              </div> 
        </AuthLayout>
      </>
    )
}

export default Register;