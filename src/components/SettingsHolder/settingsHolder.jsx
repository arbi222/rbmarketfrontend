import "./settingsHolder.css";
import PersonalInfo from "./Forms/PersonalInfo/PersonalInfo";
import Security from "./Forms/Security/security";
import Wallet from "./Forms/Wallet/wallet";

const SettingsHolder = ({menu}) => {

    const personalInfo = menu === "info";
    const security = menu === "security";
    const payments = menu === "payment";

    return (
      <>
            <h2 className="setting-holder-header">
                {personalInfo ? "Personal info" :
                security ? "Security" :
                payments && "Wallet"}
            </h2>

            {personalInfo && 
                <>
                    <PersonalInfo/>
                    <hr className="settings-hr"/>
                </>
            }

            {security && 
                <>
                    <Security/>
                    <hr className="settings-hr"/>
                </>
            }

            {payments && 
                <>
                    <hr className="settings-hr"/>
                    <Wallet  />
                </>
            }
      </>
    )
}

export default SettingsHolder;