const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming the User model is in the models folder

module.exports = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Fetch the user from MongoDB based on the decoded user ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Auth failed'
      });
    }

    // Attach the user details to the request object
    req.user = { id: user.id, email: user.email };
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Auth failed'
    });
  }
};
