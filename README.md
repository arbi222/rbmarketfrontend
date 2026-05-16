# RB Market — Frontend

> React-based frontend for RB Market, a multi-vendor eCommerce platform. Built with Redux Toolkit for state management and supports buyers, sellers, guests, and admins.

🌐 **Live Demo:** [rbmarket.arbihamolli.com](https://rbmarket.arbihamolli.com)  
🔧 **Backend Repo:** [rbMarketBackend](https://github.com/arbi222/rbMarketBackend)

---

## What Is RB Market?

RB Market is a production-ready multi-vendor eCommerce platform. This repository contains the React frontend that serves buyers, sellers, and admins. It communicates with the backend via REST APIs and Socket.io for real-time updates.

---

## Features

### For Buyers
- Browse and search products
- Guest cart — add to cart and checkout without an account
- Secure checkout with **Stripe** or **PayPal**
- Order tracking and history
- Leave product reviews and ratings
- Real-time notifications via Socket.io

### For Sellers
- List and manage products with image uploads
- View and manage incoming orders
- Transaction and revenue overview
- Real-time order notifications

### Authentication
- Register / Login with email and password
- Google OAuth 2.0 login
- Two-Factor Authentication (2FA) via email OTP
- Email verification on signup

### Admin Panel
- Full platform management
- Revenue and transaction analytics
- User account management (ban / freeze)
- Product moderation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js |
| State Management | Redux Toolkit |
| Routing | React Router |
| Real-Time | Socket.io Client |
| HTTP Client | Axios |
| Payments UI | Stripe.js, PayPal SDK |
| Styling | Pure CSS |

---

## Related Repositories

- [rbMarketBackend](https://github.com/arbi222/rbMarketBackend) — Node.js/Express backend
- [arbihamolli.com](https://arbihamolli.com) — Developer portfolio

---

## Author

**Arbi Hamolli** — Full-Stack Web Developer  
[arbihamolli.com](https://arbihamolli.com) · [LinkedIn](https://linkedin.com/in/arbi-hamolli) · [GitHub](https://github.com/arbi222)
