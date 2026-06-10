const jwt        = require('jsonwebtoken');
const EpcPartner = require('../models/EpcPartner');

const protectEpc = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'epc') {
        return res.status(401).json({ message: 'Not authorized as EPC partner' });
      }

      req.epc = await EpcPartner.findById(decoded.id).select('-password');
      if (!req.epc)      return res.status(401).json({ message: 'EPC not found' });
      if (!req.epc.isActive) return res.status(403).json({ message: 'Account deactivated' });

      next();
    } catch {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

const requireVerified = (req, res, next) => {
  if (!['Approved', 'Verified'].includes(req.epc.onboardingStatus)) {
    return res.status(403).json({ message: 'Account not yet approved by admin' });
  }
  next();
};

module.exports = { protectEpc, requireVerified };