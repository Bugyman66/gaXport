const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const Web3 = require("web3").Web3;
const TronWeb = require("tronweb");
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} = require("@solana/web3.js");
const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();

// MongoDB Models
const User = require("../models/User");
const TransactionModel = require("../models/Transaction"); // renamed to avoid conflict with Solana's Transaction
const SystemSettings = require("../models/SystemSettings");

const rpcUrls = {
  ethereum: process.env.QUICKNODE_ETH_RPC,
  tron: process.env.QUICKNODE_TRON_RPC,
  bsc: process.env.QUICKNODE_BSC_RPC,
  solana: process.env.QUICKNODE_SOLANA_RPC,
  base_eth: process.env.QUICKNODE_BASE_RPC,
  polygon: process.env.QUICKNODE_POLYGON_RPC,
  near: process.env.QUICKNODE_NEAR_RPC,
};

// Buy Route
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { crypto, amount, wallet_address } = req.body;
    const email = req.user.email;

    if (!crypto || !amount || !wallet_address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Fetch user and validate
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get crypto price and calculate total
    const priceResponse = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`
    );
    const cryptoPriceUSD = priceResponse.data[crypto]?.usd;
    if (!cryptoPriceUSD) {
      return res.status(400).json({ message: "Invalid cryptocurrency" });
    }

    // 3. Get exchange rate
    const settings = await SystemSettings.findOne();
    const usdToNgnRate = settings?.usdToNgnRate || 1600;
    const totalNaira = amount * cryptoPriceUSD * usdToNgnRate;

    // 4. Check balance
    if (user.balance < totalNaira) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 5. Validate blockchain support
    const rpcUrl = rpcUrls[crypto.toLowerCase()];
    if (!rpcUrl) {
      return res.status(400).json({ message: "Unsupported blockchain" });
    }

    let transactionHash = "";

    // 6. Process blockchain transaction
    try {
      if (["ethereum", "bsc", "base_eth", "polygon"].includes(crypto)) {
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        const sender = process.env.ADMIN_WALLET;
        const privateKey = process.env.ADMIN_PRIVATE_KEY;

        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = await web3.eth.estimateGas({
          from: sender,
          to: wallet_address,
          value: web3.utils.toWei(amount.toString(), "ether"),
        });

        const tx = {
          from: sender,
          to: wallet_address,
          value: web3.utils.toWei(amount.toString(), "ether"),
          gas: gasLimit,
          gasPrice: gasPrice,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        transactionHash = sentTx.transactionHash;
      } else if (crypto === "solana") {
        const connection = new Connection(rpcUrl, "confirmed");
        const sender = new PublicKey(process.env.ADMIN_WALLET);
        const recipient = new PublicKey(wallet_address);
        const adminKeypair = Keypair.fromSecretKey(
          new Uint8Array(JSON.parse(process.env.ADMIN_PRIVATE_KEY))
        );

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: recipient,
            lamports: amount * 1e9,
          })
        );

        transactionHash = await sendAndConfirmTransaction(
          connection,
          transaction,
          [adminKeypair]
        );
      }

      // 7. Update user balance atomically
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id, balance: { $gte: totalNaira } },
        { $inc: { balance: -totalNaira } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Balance update failed");
      }

      // 8. Create transaction record
      const newTransaction = new TransactionModel({
        email: user.email,
        type: "purchase",
        amount: totalNaira,
        crypto_amount: amount,
        crypto_type: crypto,
        wallet_address,
        transaction_hash: transactionHash,
        status: "completed",
        exchange_rate: usdToNgnRate
      });
      await newTransaction.save();

      return res.status(200).json({
        message: "Transaction successful",
        transactionHash,
        remainingBalance: updatedUser.balance,
      });
    } catch (error) {
      // If blockchain transaction fails, no balance is deducted
      console.error("Blockchain transaction error:", error);
      return res.status(500).json({
        message: "Transaction failed",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
