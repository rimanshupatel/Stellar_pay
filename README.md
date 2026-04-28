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
## 🧭 Belt System Progress
 
| Level | Belt | Focus | Status |
|-------|------|-------|--------|
| ⚪️ Level 1 | White Belt | Wallets & transactions | ✅ Completed |
| 🟡 Level 2 | Yellow Belt | Multi-wallet, contracts & events | ✅ Completed |
| 🟠 Level 3 | Orange Belt | Mini dApp + tests | ✅ Completed |
| 🟢 Level 4 | Green Belt | Advanced contracts & production readiness | ✅ Completed |
| 🔵 Level 5 | Blue Belt | Real MVP (5+ users) | 🔜 Upcoming |
| ⚫️ Level 6 | Black Belt | Scale + Demo Day readiness | 🔜 Upcoming |
 
---
 
## 🟢 Current Status: GREEN BELT (Completed)
 
---
 
## ✅ Green Belt Checklist
 
### 📦 Smart Contract (Soroban)
- ✔ Contract written in Rust with `no_std` and Soroban SDK
- ✔ WASM optimized with `opt-level = z`, `lto`, `overflow-checks`
- ✔ Deployed successfully on **Stellar Testnet**
- ✔ Contract ID: `CBKMPCT4RSI2NHJJILN7K5K6FB2ZVD7EYCB5G37UT47GJLCPZOZXYMNT`
### ⚙️ Core Contract Functions (6 Exported)
- ✔ `create_order` — Merchant creates an escrow order on-chain
- ✔ `mark_paid` — Buyer locks funds into escrow
- ✔ `release_funds` — Merchant releases funds after fulfillment
- ✔ `refund_funds` — Merchant refunds buyer on cancellation
- ✔ `get_order` — Inter-contract call to query order details
- ✔ Duplicate order protection (panics on existing `ref_id`)
### 🔗 Inter-Contract Call
- ✔ `get_order` function implemented and tested
- ✔ Returns full order struct: `amount`, `merchant`, `buyer`, `status`, `token`, `tx_hash`
- ✔ Read-only simulation verified on testnet
### 🪙 Custom Token (SAC)
- ✔ Custom SPAY token deployed on testnet
- ✔ Token Contract ID: `CDSFTA5O2CZCLZ6YSKWSPSJZSDONLTTMUYJHN2NCSPGD2VRKLRO7HXAV`
- ✔ Escrow deposit tested with SPAY token (500 SPAY locked & released)
- ✔ Contract works with **any SAC token** (not just native XLM)
### 🧪 Tests (All Passed ✅)
- ✔ `test_escrow_flow` — Create → Mark Paid → Release funds
- ✔ `test_escrow_refund` — Create → Mark Paid → Refund to buyer
- ✔ Duplicate order rejection — Second deposit with same `ref_id` correctly fails
- ✔ Custom SPAY token deposit + release on testnet
- ✔ Inter-contract `get_order` query verified on testnet
### 🔄 CI/CD
- ✔ GitHub Actions workflow configured
- ✔ Auto-runs `cargo test` on every push and pull request
- ✔ Target: `wasm32-unknown-unknown`
### 💻 Mobile Responsive 
<img width="1920" height="1080" alt="photo-collage png" src="https://github.com/user-attachments/assets/560c2d40-5bad-4710-9c4f-a5a771db27d5" />

---
 
## 📸 Demo Screenshots
 
###  Create Order ->  Mark Paid -> Release
<img width="1981" height="813" alt="Screenshot 2026-04-29 020933" src="https://github.com/user-attachments/assets/f42323f3-dff6-4594-af34-2ddb362c9be7" />
 

### Inter-Contract Call (get_order)
<img width="1514" height="244" alt="image" src="https://github.com/user-attachments/assets/6c5d5a04-c706-4e9c-90e8-9526de9cd29d" />

---

## 🟠 ORANGE BELT (Completed)

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
