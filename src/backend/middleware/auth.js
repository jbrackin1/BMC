const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

exports.requireAdmin = (req, res, next) => {
  const role = req.user.role?.toLowerCase();
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
};

exports.requirePatient = (req, res, next) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ error: 'Patient access only' });
  }
  next();
};