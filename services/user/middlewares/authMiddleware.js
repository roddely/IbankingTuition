
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    
    req.userId = decoded.id; 
    next();
  } catch (err) {

    res.clearCookie("token"); 
    return res.status(401).json({ message: "Not authorized, token failed or expired" });
  }
};

module.exports = { protect };