const jwt        = require('jsonwebtoken');
const EpcPartner = require('../models/EpcPartner');

const generateToken = (id) =>
  jwt.sign({ id, type: 'epc' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/epc/auth/register
const registerEpc = async (req, res) => {
  try {
    const { companyName, ownerName, email, mobile, password, state, district, city, pincode, address, yearsOfExperience } = req.body;

    if (!companyName || !ownerName || !email || !mobile || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });

    if (await EpcPartner.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    if (await EpcPartner.findOne({ mobile }))
      return res.status(400).json({ message: 'Mobile already registered' });

    const exp  = Number(yearsOfExperience) || 0;
    const plan = exp >= 5 ? 'Enterprise' : exp >= 2 ? 'Professional' : 'Standard';

    const epc = await EpcPartner.create({
      companyName, ownerName, email, mobile, password,
      state, district, city, pincode, address,
      yearsOfExperience: exp,
      plan,
      activeDistricts:  district ? [district] : [],
      onboardingStatus: 'Pending',
    });

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      epc: {
        _id: epc._id, companyName: epc.companyName, ownerName: epc.ownerName,
        email: epc.email, mobile: epc.mobile, plan: epc.plan,
        onboardingStatus: epc.onboardingStatus,
      },
      token: generateToken(epc._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/auth/login
const loginEpc = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const epc = await EpcPartner.findOne({ email });
    if (!epc || !(await epc.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!epc.isActive)
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    res.json({
      _id:              epc._id,
      companyName:      epc.companyName,
      ownerName:        epc.ownerName,
      email:            epc.email,
      mobile:           epc.mobile,
      plan:             epc.plan,
      onboardingStatus: epc.onboardingStatus,
      activeDistricts:  epc.activeDistricts,
      rating:           epc.rating,
      token:            generateToken(epc._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/auth/profile
const getEpcProfile = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id).select('-password');
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    res.json(epc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/epc/auth/profile
const updateEpcProfile = async (req, res) => {
  try {

    console.log('req.epc:', req.epc);        // ← yeh add karo
    console.log('req.body:', req.body);
    
    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    const fields = ['companyName', 'ownerName', 'mobile', 'state', 'city', 'pincode', 'address', 'hqLocation'];
    fields.forEach(f => { if (req.body[f]) epc[f] = req.body[f]; });
    if (req.body.password) epc.password = req.body.password;

    const updated = await epc.save();
    res.json({ _id: updated._id, companyName: updated.companyName, email: updated.email, plan: updated.plan });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { registerEpc, loginEpc, getEpcProfile, updateEpcProfile };