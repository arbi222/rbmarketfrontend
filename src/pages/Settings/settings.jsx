import Footer from "../../components/Footer/footer";
import Navbar from "../../components/Navbar/navbar";
import PageTitle from "../../components/PageTitle/pageTitle";
import PayMethodAction from "../../components/PaymentMethods/PayMethodAction/payMethodAction";
import SettingsSections from "../../components/SettingsSections/settingsSections";
import "./settings.css";

const Settings = () => {
  return (
    <div className="settings-wrapper">
        <PageTitle title="Settings | RB Market" />
        <PayMethodAction from={"/checkout?"} />
        <Navbar usage="settings" />
        <SettingsSections />
        <Footer usage="settings"/>
    </div>
  )
}

export default Settings;