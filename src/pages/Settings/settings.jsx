import Footer from "../../components/Footer/footer";
import Navbar from "../../components/Navbar/navbar";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";
import SettingsSections from "../../components/SettingsSections/settingsSections";
import "./settings.css";

const Settings = () => {
  return (
    <div className="settings-wrapper">
        <div className="settings-page-wrapper">
          <PageTitle title="Settings | RB Market" />
          <PayMethodAction from={"/checkout?"} />
          <Navbar usage="settings" />
          <SettingsSections />
        </div>
        <Footer usage="settings"/>
    </div>
  )
}

export default Settings;