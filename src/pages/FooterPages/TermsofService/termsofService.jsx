import "../../FooterPages/footerPages.css";
import MarketLogo from '../../../components/MarketLogo/marketLogo';
import PageTitle from "../../../components/PageTitle/pageTitle";

const TermsofService = () => {
    return (
      <div className='legal-container'>
        <PageTitle title={"Terms of Service | RB Market"}/>
        <div className='market-logo-style'>
            <MarketLogo />
        </div>

        <div className="legal-content">
          <h1>Terms of Service</h1>
          <p className="last-updated">
            Last updated: 07/03/2026
          </p>

            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Rb Market, you agree to be bound by these
                Terms of Service. If you do not agree, you must not use the platform.
              </p>
            </section>

            <section>
              <h2>2. Platform Role</h2>
              <p>
                Rb Market is a global online marketplace connecting buyers and
                sellers of physical goods.
              </p>
              <p>
                Rb Market may list and sell products on the platform but does not
                purchase products from other users.
              </p>
            </section>

            <section>
              <h2>3. User Roles</h2>
              <p>Users may operate as:</p>
              <ul>
                <li>Buyer</li>
                <li>Seller</li>
                <li>Both Buyer and Seller simultaneously</li>
              </ul>
              <p>
                A single account may buy and sell products without restriction.
              </p>
              <p>
                The platform administrator ("Rb Market") may sell products but
                cannot purchase products.
              </p>
            </section>

            <section>
              <h2>4. Seller Responsibility</h2>
              <p>
                Sellers are solely responsible for:
              </p>
              <ul>
                <li>Product accuracy</li>
                <li>Product quality</li>
                <li>Sellers are responsible for fulfilling orders within a reasonable timeframe as stated in the product listing.</li>
                <li>Compliance with applicable laws</li>
              </ul>
              <p>
                Rb Market is not liable for product defects, misrepresentation,
                or delivery failures caused by sellers.
              </p>
            </section>

            <section>
              <h2>5. Wallet & Payments</h2>

              <h3>5.1 Wallet Usage</h3>
              <p>
                All product purchases on Rb Market are completed using the user's
                internal wallet balance.
              </p>
              <p>
                Wallet balances do not constitute a bank account, financial account,
                or stored monetary value. Rb Market does not provide banking services.
              </p>

              <h3>5.2 Adding Funds</h3>
              <p>
                Users may add funds to their wallet using third-party payment
                providers such as Stripe and PayPal.
              </p>
              <p>
                These providers are used exclusively for depositing funds into
                and withdrawing funds from the wallet. They are not used directly
                for product purchases.
              </p>

              <h3>5.3 Initial Withdrawal Restriction</h3>
              <p>
                Following a user's first successful wallet deposit or first product sale,
                withdrawals are restricted for a period of seven (7) days.
              </p>
              <p>
                This security measure is implemented to prevent fraud,
                unauthorized transactions, and chargeback abuse.
              </p>

              <h3>5.4 Withdrawals</h3>
              <p>
                After the initial restriction period, sellers may withdraw
                available wallet funds via Stripe or PayPal, provided no
                suspicious or fraudulent activity is detected.
              </p>

              <h3>5.5 Platform Commission</h3>
                <p>
                  Rb Market charges a fixed commission of {import.meta.env.VITE_PLATFORM_FEE_PERCENT}% on each successfully
                  completed product sale.
                </p>
                <p>
                  This commission is automatically deducted from the total sale
                  amount before funds are credited to the seller's wallet.
                </p>
                <p>
                  Rb Market reserves the right to modify the commission rate in
                  the future. Any changes will be communicated through an update
                  to these Terms of Service.
                </p>
            </section>

            <section>
                <h2>6. Chargebacks & Fraud Protection</h2>
                <p>
                  Users are responsible for ensuring that any funds deposited into
                  their wallet are authorized and legitimate.
                </p>
                <p>
                  In the event of a chargeback, reversed payment, or fraudulent
                  transaction, Rb Market reserves the right to:
                </p>
                <ul>
                  <li>Freeze the user's account</li>
                  <li>Reverse wallet balances</li>
                  <li>Recover owed funds</li>
                  <li>Permanently suspend the account</li>
                </ul>
                <p>
                  Any attempt to abuse the wallet or payment system may result
                  in legal action.
                </p>
            </section>

            <section>
              <h2>7. No Refund Policy</h2>
              <p>
                All purchases made using wallet funds are final.
              </p>
              <p>
                Once a product is purchased, it cannot be refunded, returned, or
                exchanged.
              </p>
            </section>

            <section>
              <h2>8. Account Deletion</h2>
              <p>
                Buyers may delete their account at any time.
              </p>
              <p>
                Sellers may delete their account only if their wallet balance is $0.
              </p>
              <p>
                Users are responsible for withdrawing remaining funds before
                deletion.
              </p>
            </section>

            <section>
              <h2>9. Prohibited Activities</h2>
              <ul>
                <li>Listing illegal goods</li>
                <li>Fraudulent activity</li>
                <li>Manipulating wallet balances</li>
                <li>Abusing the payment system</li>
                <li>Attempting to bypass commission structure</li>
              </ul>
              <p>
                Violations may result in suspension or permanent account termination.
              </p>
            </section>

            <section>
              <h2>10. Account Suspension</h2>
              <p>
                Rb Market reserves the right to temporarily suspend or permanently
                terminate user accounts suspected of fraudulent activity,
                abuse of the platform, or violations of these Terms.
              </p>
            </section>

            <section>
              <h2>11. Limitation of Liability</h2>
              <p>
                Rb Market is not responsible for:
              </p>
              <ul>
                <li>Seller misconduct</li>
                <li>Product defects</li>
                <li>Delivery failures</li>
                <li>Losses caused by third-party payment providers</li>
              </ul>
            </section>

            <section>
              <h2>12. Modifications</h2>
              <p>
                Rb Market reserves the right to update these Terms at any time.
                Continued use of the platform constitutes acceptance of the updated
                Terms.
              </p>
            </section>
        </div>
      </div>
    )
}

export default TermsofService;