const EpcPlan    = require('../models/EpcPlan');
const EpcPartner = require('../models/EpcPartner');

// GET /api/epc/plans  (PUBLIC)
// Document: EPC partners can see existing plans and upgrade
const getAllPlans = async (req, res) => {
  try {
    const plans = await EpcPlan.find({ isActive: true }).sort({ monthlyFee: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/plans/my-plan
const getMyPlan = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id)
      .select('plan planExpiresAt activeDistricts rating totalRatings');
    const planDetails = await EpcPlan.findOne({ name: epc.plan, isActive: true });
    res.json({
      currentPlan:     epc.plan,
      planExpiresAt:   epc.planExpiresAt,
      activeDistricts: epc.activeDistricts,
      rating:          epc.rating,
      totalRatings:    epc.totalRatings,
      planDetails,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/plans/upgrade
const requestUpgrade = async (req, res) => {
  try {
    const { newPlan, billingCycle } = req.body;
    const validPlans = ['Standard', 'Professional', 'Enterprise'];
    if (!validPlans.includes(newPlan))
      return res.status(400).json({ message: 'Invalid plan' });

    const epc = await EpcPartner.findById(req.epc._id);
    if (epc.plan === newPlan)
      return res.status(400).json({ message: 'Already on this plan' });

    const plan = await EpcPlan.findOne({ name: newPlan, isActive: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    if (epc.yearsOfExperience < plan.minYearsExperience)
      return res.status(400).json({
        message: `Minimum ${plan.minYearsExperience} years experience required for ${newPlan} plan`,
      });

    epc.plan = newPlan;
    const expiry = new Date();
    if (billingCycle === 'Annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);
    epc.planExpiresAt = expiry;

    await epc.save();
    res.json({ message: `Plan upgraded to ${newPlan}`, plan: epc.plan, expiresAt: epc.planExpiresAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllPlans, getMyPlan, requestUpgrade };