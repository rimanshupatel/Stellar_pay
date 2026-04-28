# 🚀 StellarPay - Modern Fintech Payment Gateway (v2.0)

A **production-grade fintech mini-dApp** built on the **Stellar blockchain + Soroban smart contracts**, enabling QR-based crypto payments, merchant settlement flow, and INR analytics dashboard with a modern Stripe/PhonePe-style UI.

---

## 🌟 Key Features

- 💳 QR-based instant crypto payments (XLM / USDC)
- 👤 Dual role system (User + Merchant dashboard)
- 📊 Real-time analytics + transaction history
- 🔐 Freighter wallet integration (Stellar authentication)
- ⛓️ Soroban smart contract integration (deposit, release, refund)
- 🧾 MongoDB-backed transaction storage
- 🎨 Modern fintech UI (glassmorphism + animations)
- 📱 Fully responsive mobile-first design

---

## 🏆 Stellar Journey to Master

### 🧭 Belt System Progress

| Level | Belt | Focus |
|------|------|------|
| ⚪️ Level 1 | White Belt | Wallets & transactions |
| 🟡 Level 2 | Yellow Belt | Multi-wallet, contracts & events |
| 🟠 Level 3 | Orange Belt | Mini dApp + tests |
| 🟢 Level 4 | Green Belt | Advanced contracts & production readiness |
| 🔵 Level 5 | Blue Belt | Real MVP (5+ users) |
| ⚫️ Level 6 | Black Belt | Scale + Demo Day readiness |

---

## 🟠 Current Status: ORANGE BELT (Completed)

### ✅ Smart Contract (Soroban)
- Deployed successfully on Stellar Testnet

### ✅ Core Functions
- ✔ Deposit working  
- ✔ Release working  
- ✔ Refund working  

### ✅ Tests (3/3 PASSED)
- ✔ Send transaction test  
- ✔ Fetch transaction test  
- ✔ Contract interaction validation  

---

## 🎥 Demo

📽️ Demo Video: *(level 3 Belt)*  
https://drive.google.com/file/d/1od0RteWNM1KVNOdhEriIyJGpgX7n9vT7/view?usp=sharing

---
## demo - 3 cases passes (smart Contracts)
<img width="2560" height="1516" alt="Screenshot 2026-04-28 210353" src="https://github.com/user-attachments/assets/88b47847-0a5f-4aed-b72c-07807f77cf5e" />


## 💡 Project Overview

### 👤 User Flow
1. Scan merchant QR
2. Pay using Freighter wallet
3. Transaction executed on Stellar network
4. View payment history

### 🏪 Merchant Flow
1. Generate QR with amount & currency
2. User pays via wallet
3. Merchant manually releases funds
4. Revenue tracked in dashboard

---

## ⚠️ Current Limitations

### Working:
- QR payment system
- Wallet integration
- Smart contract execution
- Transaction tracking
- Merchant dashboard

### Needs Improvement:
- ❌ No automatic escrow binding (payment ↔ order)
- ❌ No full on-chain verification between QR and contract state
- ❌ Manual release instead of trustless automation

---

## 🛠️ Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB

### Blockchain
- Stellar Testnet
- Soroban Smart Contracts
- Freighter Wallet
- Stellar SDK

---

## 📁 Project Structure

```bash
frontend/
 ├── pages/
 │   ├── User.jsx
 │   ├── Merchant.jsx
 │   └── Landing.jsx
 ├── components/

backend/
 ├── index.js

contracts/
 ├── Soroban smart contracts
```
---
## 🔌 API Endpoints

### 💳 Payments
- POST `/api/create-payment` → Create QR-based payment order  
- POST `/api/release-order` → Release funds after successful payment  
- POST `/api/transactions` → Store transaction in database  

### 📊 Analytics
- GET `/api/transactions/:wallet` → Fetch user transaction history  
- GET `/api/merchant/:id/stats` → Get merchant revenue & stats  

---

## 🧪 Smart Contract Tests

✔ Smart contract deployment successful on Stellar Testnet  
✔ Deposit function tested and working  
✔ Release function tested and working  
✔ Refund function tested and working  

---

## 🎨 UI Philosophy

- Clean fintech-grade UI inspired by Stripe / PhonePe  
- Glassmorphism-based modern design system  
- Smooth micro-interactions using Framer Motion  
- Mobile-first fully responsive layout  
- Focus on trust, clarity, and fast user experience  
---
## 📌 Next Upgrade Roadmap (Green Belt)

- 🔐 On-chain escrow automation using Soroban smart contracts  
- 🤝 Payment ↔ QR binding via contract (fully verifiable order linking)  
- ⚡ Real-time event listener (WebSocket / contract event streaming)  
- 🧾 Fully trustless merchant settlement system (no manual release)  
- 📊 Advanced fraud detection layer (transaction pattern + risk scoring)  
- 🔄 Inter-contract calls (if applicable for modular finance logic)  
- 🪙 Custom token / liquidity pool integration (if used in ecosystem)  
- 🚀 CI/CD pipeline for automated build + deployment  
- 📱 Fully mobile-optimized responsive production UI  
- 🧪 Minimum 8+ meaningful commits with proper modular architecture
📄 License

MIT
