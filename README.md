# StellarPay - Modern Fintech Payment Gateway

A premium fintech web application for crypto-to-INR payments built on Stellar blockchain. Features a modern, polished UI similar to Google Pay, PhonePe, and Stripe.

## 🌟 Features

- **Modern Fintech UI**: Clean, professional design with dark mode support
- **QR Code Payments**: Scan-to-pay functionality for instant transactions
- **Real-time Dashboard**: Analytics, charts, and transaction history
- **MongoDB Integration**: Persistent storage for transactions and orders
- **Stellar Blockchain**: Built on Stellar network for fast, low-cost payments
- **Responsive Design**: Mobile-first, works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Freighter wallet extension (for Stellar payments)

### Installation

1. **Clone and install dependencies:**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. **Set up environment variables:**

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://rimanshupatel3_db_user:<YOUR_PASSWORD>@cluster0.feb7kvl.mongodb.net/stellarPay
PORT=3000
```

3. **Start the development servers:**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Open the app:**

Visit `http://localhost:5173` (or the port Vite assigns)

## 📁 Project Structure

```
steller_pay_copy/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ConnectWallet.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx  # Landing page
│   │   │   ├── User.jsx     # User dashboard & payment
│   │   │   └── Merchant.jsx # Merchant dashboard
│   │   ├── lib/
│   │   │   └── utils.js     # Utility functions
│   │   └── App.jsx
│   └── tailwind.config.js
├── backend/
│   ├── index.js             # Express server + MongoDB
│   └── .env                 # Environment variables
└── contracts/               # Soroban smart contracts
```

## 🎨 UI Components

- **Card**: Glassmorphism cards with hover effects
- **Button**: Multiple variants (primary, outline, ghost, danger)
- **Badge**: Status indicators with color coding
- **Loader**: Animated loading spinners
- **Charts**: Revenue trends using Recharts

## 🔌 API Endpoints

### Payment
- `POST /api/create-payment` - Generate payment QR
- `POST /api/release-order` - Release currency after payment
- `POST /api/transactions` - Save transaction

### Data
- `GET /api/transactions/:walletAddress` - Get user transactions
- `GET /api/merchant/:merchantId/transactions` - Get merchant transactions
- `GET /api/merchant/:merchantId/stats` - Get merchant statistics

## 🎯 Usage

### As a User:
1. Connect your Stellar wallet (Freighter)
2. Navigate to "Pay" tab
3. Scan merchant's QR code or use demo payment
4. Confirm and approve transaction
5. View transaction history

### As a Merchant:
1. Connect your wallet
2. Go to "Generate QR" tab
3. Enter amount and currency
4. Display QR code to customer
5. Release currency after payment confirmation
6. View analytics and transaction history

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Axios (HTTP client)
- Lucide React (icons)

**Backend:**
- Express.js
- MongoDB
- Stellar SDK

## 📝 Notes

- Uses Stellar Testnet by default
- MongoDB connection string should be in `.env`
- All payments are on testnet (no real money)
- USDC trustline required for USDC payments

## 🎨 Design Philosophy

- **Clean & Minimal**: Focus on essential features
- **Trustworthy**: Professional fintech aesthetic
- **Fast**: Optimized performance and smooth animations
- **Accessible**: Dark mode, responsive, keyboard navigation

## 📄 License

MIT
