import "../../FooterPages/footerPages.css";
import MarketLogo from '../../../components/MarketLogo/marketLogo';
import PageTitle from "../../../components/PageTitle/pageTitle";

const PrivacyPolicy = () => {
    return (
      <div className='legal-container'>
        <PageTitle title={"Privacy Policy | RB Market"}/>
        <div className='market-logo-style'>
            <MarketLogo />
        </div>

        <div className="legal-content">
            <h1>Privacy Policy</h1>
            <p className="last-updated">
              Last updated: 07/03/2026
            </p>

            <section>
              <h2>1. Information We Collect</h2>
              <p>Rb Market collects the following information from users:</p>
              <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Google profile data (if using Google login)</li>
                <li>Wallet balances and transaction history</li>
                <li>Session cookies for authentication</li>
              </ul>
            </section>

            <section>
              <h2>2. Authentication</h2>
              <p>
                Rb Market supports the following authentication methods:
              </p>
              <ul>
                <li>Email and password login</li>
                <li>Google OAuth</li>
                <li>Two-factor authentication (2FA)</li>
              </ul>
              <p>
                Passwords are securely hashed and never stored in plain text.
              </p>
            </section>

            <section>
              <h2>3. Payments & Wallet</h2>
              <p>
                Users can deposit and withdraw funds from their wallet using third-party providers:
              </p>
              <ul>
                <li>Stripe</li>
                <li>PayPal</li>
              </ul>
              <p>
                Payments are used solely for adding funds to the wallet and withdrawing funds. Product purchases are completed exclusively with wallet balances.
              </p>
              <p>
                <strong>Withdraw Restrictions:</strong> After a user's first successful wallet deposit, withdrawals are restricted for a period of seven (7) days to prevent fraud and chargeback abuse.
              </p>
            </section>

            <section>
              <h2>4. Use of Information</h2>
              <p>We use the information collected to:</p>
              <ul>
                <li>Operate the marketplace and enable buying/selling of products</li>
                <li>Process wallet transactions and withdrawals</li>
                <li>Ensure account and platform security</li>
                <li>Prevent fraud and monitor suspicious activity</li>
                <li>Communicate with users regarding platform updates</li>
              </ul>
            </section>

            <section>
              <h2>5. Data Sharing</h2>
              <p>
                We do not sell user data to third parties.
              </p>
              <p>We may share limited information in the following situations:</p>
              <ul>
                <li>With payment providers (Stripe, PayPal) for deposits and withdrawals</li>
                <li>To comply with legal obligations or respond to lawful requests</li>
                <li>To protect the rights, safety, or property of Rb Market or users</li>
              </ul>
            </section>

            <section>
              <h2>6. Data Retention & Deletion</h2>
              <p>
                Users may request deletion of their account at any time.  
                Sellers must withdraw all wallet funds before account deletion.
              </p>
              <p>
                Transaction history may be retained for accounting, auditing, or legal compliance purposes.
              </p>
            </section>

            <section>
              <h2>7. Cookies & Session Data</h2>
              <p>
                We use cookies and session storage to maintain secure authentication and improve platform functionality.
              </p>
              <p>
                These cookies are necessary for wallet operations, login sessions, and fraud detection.
              </p>
            </section>

            <section>
              <h2>8. Security</h2>
              <p>
                Rb Market implements industry-standard measures to protect user data, including:
              </p>
              <ul>
                <li>Encrypted passwords and secure authentication</li>
                <li>Monitoring for suspicious wallet activity</li>
                <li>Access controls and limited internal access</li>
              </ul>
            </section>

            <section>
              <h2>9. Changes to Privacy Policy</h2>
              <p>
                Rb Market reserves the right to modify this Privacy Policy at any time. Continued use of the platform constitutes acceptance of the updated policy.
              </p>
            </section>
        </div>
    </div>
    )
}

export default PrivacyPolicy;