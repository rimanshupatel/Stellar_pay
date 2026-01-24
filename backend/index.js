const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
// Make sure serviceAccountKey.json is populated!
try {
  const serviceAccount = require('./serviceAccountKey.json');
  if (serviceAccount.project_id !== "YOUR_PROJECT_ID") {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin Initialized");
  } else {
      console.warn("Firebase serviceAccountKey.json not configured.");
  }
} catch (error) {
  console.warn("Error initializing Firebase:", error.message);
}

// Routes

// 1. Generate Payment Request (Merchant)
// Returns a payload that the Frontend converts to QR Code.
// Payload: { merchantAddress: "...", amount: 100, refId: "unique_order_id" }
app.post('/api/create-payment', async (req, res) => {
    const { merchantAddress, amount, currency } = req.body;
    
    // In a real app, we might save this order to Firebase first.
    const refId = 'order_' + Date.now(); // Simple ID generation
    
    // Save to Firebase (if initialized)
    if (admin.apps.length) {
        try {
            await admin.firestore().collection('orders').doc(refId).set({
                merchantAddress,
                amount,
                currency,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("Firebase Key error", e);
        }
    }

    res.json({
        refId,
        merchantAddress,
        amount,
        currency,
        qrData: `${merchantAddress}|${amount}|${currency}|${refId}`
    });
});

// 2. Release Funds (Merchant Manual Trigger or Automated)
// Merchant confirms they gave cash, so they mark order as 'released'.
app.post('/api/release-order', async (req, res) => {
    const { refId } = req.body;
    
    if (admin.apps.length) {
        await admin.firestore().collection('orders').doc(refId).update({
            status: 'released'
        });
        res.json({ success: true, message: "Order released" });
    } else {
        res.json({ success: true, message: "Order released (mock)" });
    }
});

// 3. Webhook/Listener for Blockchain Events (Optional/Advanced)
// We could run a Soroban Event watcher here to detect 'Payment' events and auto-mark 'paid'.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
