const mongoose = require('mongoose');

// MongoDB connection URI (make sure to replace this with your actual MongoDB URI)
const mongoURI = 'mongodb://localhost:27017/gas_fee_app'; // Replace with your actual MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB database');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB database:', err.message);
    process.exit(1); // Exit if connection fails
  });

// Export mongoose for use in other parts of the app
module.exports = mongoose;
