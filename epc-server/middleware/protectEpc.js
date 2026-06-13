const jwt = require('jsonwebtoken');
const EpcPartner = require('../models/EpcPartner');

const protectEpc = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'epc') {
      return res.status(401).json({ message: 'Not authorized as EPC partner' });
    }

    const epc = await EpcPartner.findById(decoded.id).select('-password');

    if (!epc) {
      return res.status(401).json({ message: 'EPC not found' });
    }

    if (!epc.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    req.epc = epc;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// ✅ Only verified EPC can access
const requireVerified = (req, res, next) => {
  if (!['Approved', 'Verified'].includes(req.epc.onboardingStatus)) {
    return res.status(403).json({ message: 'Account not approved by admin' });
  }
  next();
};

module.exports = { protectEpc, requireVerified };