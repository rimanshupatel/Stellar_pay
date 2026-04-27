const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stellarPay';

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('stellarPay');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
}

connectDB();

// Routes

// 1. Generate Payment Request (Merchant)
app.post('/api/create-payment', async (req, res) => {
  try {
    const { merchantAddress, amount, currency } = req.body;

    if (!merchantAddress || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const refId = 'order_' + Date.now();
    const qrData = `${merchantAddress}|${amount}|${currency}|${refId}`;

    // Save to MongoDB
    if (db) {
      await db.collection('orders').insertOne({
        refId,
        merchantAddress,
        amount: parseFloat(amount),
        currency,
        status: 'pending',
        createdAt: new Date(),
        qrData
      });
    }

    res.json({
      refId,
      merchantAddress,
      amount,
      currency,
      qrData
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.collection('users').findOne({ email: decoded.email });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});


app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword, name, role };
    await db.collection('users').insertOne(newUser);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return user object without password
    const userWithoutPassword = { email, name, role };

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});
// 2. Release Funds (Merchant)
app.post('/api/release-order', async (req, res) => {
  try {
    const { refId } = req.body;

    if (!refId) {
      return res.status(400).json({ error: 'Missing refId' });
    }

    if (db) {
      await db.collection('orders').updateOne(
        { refId },
        { $set: { status: 'released', releasedAt: new Date() } }
      );
    }

    res.json({ success: true, message: 'Order released' });
  } catch (error) {
    console.error('Release order error:', error);
    res.status(500).json({ error: 'Failed to release order' });
  }
});

// 3. Save Transaction (User payment)
app.post('/api/transactions', async (req, res) => {
  try {
    const { walletAddress, merchantId, cryptoAmount, currency, inrAmount, status, txHash, refId } = req.body;

    if (!walletAddress || !merchantId || !cryptoAmount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify transaction with Stellar Horizon
    try {
      const { Horizon } = require('@stellar/stellar-sdk');
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const tx = await server.transactions().transaction(txHash).call();
      
      if (!tx.successful) {
         return res.status(400).json({ error: 'Transaction failed on network' });
      }
    } catch (e) {
      console.error('Transaction verification failed:', e);
      return res.status(400).json({ error: 'Invalid or missing transaction on network' });
    }

    const transaction = {
      walletAddress,
      merchantId,
      cryptoAmount: parseFloat(cryptoAmount),
      currency,
      inrAmount: parseFloat(inrAmount || 0),
      status: status || 'success',
      txHash,
      refId,
      timestamp: new Date(),
      createdAt: new Date()
    };

    if (db) {
      await db.collection('transactions').insertOne(transaction);

      // Update order status if refId exists
      if (refId) {
        await db.collection('orders').updateOne(
          { refId },
          { $set: { status: 'paid', paidAt: new Date(), txHash } }
        );
      }
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Save transaction error:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

// 4. Get User Transactions
app.get('/api/transactions/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!db) {
      return res.json([]);
    }

    const transactions = await db.collection('transactions')
      .find({ walletAddress })
      .sort({ timestamp: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 5. Get Merchant Transactions
app.get('/api/merchant/:merchantId/transactions', async (req, res) => {
  try {
    const { merchantId } = req.params;

    if (!db) {
      return res.json([]);
    }

    const transactions = await db.collection('transactions')
      .find({ merchantId })
      .sort({ timestamp: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    console.error('Get merchant transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 6. Get Merchant Stats
app.get('/api/merchant/:merchantId/stats', async (req, res) => {
  try {
    const { merchantId } = req.params;

    if (!db) {
      return res.json({
        totalRevenue: 0,
        todayRevenue: 0,
        totalTransactions: 0,
        pendingOrders: 0
      });
    }

    const transactions = await db.collection('transactions')
      .find({ merchantId, status: 'success' })
      .toArray();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.inrAmount || 0), 0);
    const todayRevenue = transactions
      .filter(tx => new Date(tx.timestamp) >= today)
      .reduce((sum, tx) => sum + (tx.inrAmount || 0), 0);

    const pendingOrders = await db.collection('orders')
      .countDocuments({ merchantAddress: merchantId, status: 'pending' });

    res.json({
      totalRevenue,
      todayRevenue,
      totalTransactions: transactions.length,
      pendingOrders
    });
  } catch (error) {
    console.error('Get merchant stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
