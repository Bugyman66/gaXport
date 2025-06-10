require("dotenv").config();
const { ethers } = require("ethers");

// Function to send ETH or MATIC
async function sendCrypto({ privateKey, to, amount, network = "eth" }) {
  try {
    let rpcUrl;
    if (network === "eth") {
      rpcUrl = process.env.QUICKNODE_ETH_RPC;
      if (!rpcUrl) throw new Error("Ethereum RPC URL is missing. Set QUICKNODE_ETH_RPC in your environment variables.");
    } else if (network === "matic") {
      rpcUrl = process.env.QUICKNODE_MATIC_RPC;
      if (!rpcUrl) throw new Error("Polygon RPC URL is missing. Set QUICKNODE_MATIC_RPC in your environment variables.");
    } else {
      throw new Error("Invalid network specified. Use 'eth' for Ethereum or 'matic' for Polygon.");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Preparing ${network.toUpperCase()} Transaction...`);
    console.log(`To: ${to}, Amount: ${amount} ${network.toUpperCase()}`);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} ${network.toUpperCase()}`);

    if (balance.lt(ethers.parseEther(amount.toString()))) {
      throw new Error("Insufficient balance to complete transaction.");
    }

    // Estimate gas price
    const gasPrice = await provider.getGasPrice();
    console.log(`Current Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);

    // Send transaction
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString()),
      gasPrice,
    });

    console.log(`Transaction sent! Waiting for confirmation... TX Hash: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error(`${network.toUpperCase()} Transaction Error:`, error.message);
    return { success: false, message: error.message };
  }
}

module.exports = { sendCrypto };
