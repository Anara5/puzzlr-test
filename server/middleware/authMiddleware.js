const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Extract the token from the "Bearer token" format
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    // Check if userId exists in the decoded token
    if (!decoded.userId) {
      return res.status(401).json({ msg: "Invalid token format" })
    }

    // Set user ID in request
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

