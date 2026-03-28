import { useEffect } from 'react'
import Sidebar from '../../adminComponents/Sidebar/sidebar';
import Navbar from '../../components/Navbar/navbar';
import { useSelector } from 'react-redux';
import MarketLogo from '../../components/MarketLogo/marketLogo';
import AOS from "aos";
import "aos/dist/aos.css";
import PageTitle from '../../components/PageTitle/pageTitle';


const Admin = () => {

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
        AOS.init({
          duration: 1300, 
          once: true,
          offset: 30,
          easing: "ease-in-out",
        });
      }, []);

  if (!userInfo.isAdmin){
    return (
      <div className='no-admin-allowance'>
        <MarketLogo />
        <p className='allowance-message'>You are not allowed to access this page!</p>
      </div>
    )
  }

  return (
    <div>
        <PageTitle title="Admin Panel | RB Market" />
        <Navbar usage={"admin"}/>
        <Sidebar />
    </div>
  )
}

export default Admin;