const EpcEnquiry = require('../models/EpcEnquiry');
const EpcOrder   = require('../models/EpcOrder');
const EpcPartner = require('../models/EpcPartner');

// GET /api/epc/enquiries
const getMyEnquiries = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id);
    const { status, projectType, district } = req.query;

    const filter = {
      district: { $in: epc.activeDistricts },
      $or: [
        // EPC ki apni enquiries
        { epcPartner: req.epc._id },
        // Unassigned enquiries jo EPC dekh sakta hai
        {
          epcPartner: null,
          status: { $in: ['Open For EPC', 'Bid Running', 'Lead', 'Token Paid', 'Order Generated'] }
        },
      ],
    };

    // Query filters
    if (status)   filter.status      = status;
    if (projectType) filter.projectType = projectType;
    if (district && epc.activeDistricts.includes(district)) {
      filter.district = district;
    }

    const enquiries = await EpcEnquiry.find(filter).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('getMyEnquiries error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/epc/enquiries/:id
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/epc/enquiries/:id/accept
const acceptEnquiry = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    // Fix: naye status flow ke hisaab se check karo
    const acceptableStatuses = ['Open For EPC', 'Bid Running', 'New'];
    if (!acceptableStatuses.includes(enquiry.status)) {
      return res.status(400).json({
        message: `Cannot accept enquiry with status: ${enquiry.status}`
      });
    }

    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc.activeDistricts.includes(enquiry.district)) {
      return res.status(403).json({ message: 'This district is not in your active plan' });
    }

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    enquiry.epcPartner    = req.epc._id;
    enquiry.status        = 'EPC Accepted';       // Fix: naya status
    enquiry.acceptedAt    = new Date();
    enquiry.acceptanceFee = req.body.acceptanceFee || 0;
    enquiry.customerSelectionDeadline = deadline;

    await enquiry.save();
    res.json({
      message: 'Enquiry accepted! Customer has 24 hours to select EPC.',
      enquiry,
      customerDeadline: deadline,
    });
  } catch (err) {
    console.error('acceptEnquiry error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/epc/enquiries/:id/convert-order
const convertToOrder = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    if (enquiry.convertedToOrder) {
      return res.status(400).json({ message: 'Already converted to order' });
    }

    // Fix: naye status ke hisaab se check
    const convertibleStatuses = ['EPC Accepted', 'Customer Selected EPC'];
    if (!convertibleStatuses.includes(enquiry.status)) {
      return res.status(400).json({
        message: `Enquiry status must be 'EPC Accepted' or 'Customer Selected EPC' to convert`
      });
    }

    const { totalProjectValue, scheduledInstallDate, dueDateForCompletion } = req.body;

    const order = await EpcOrder.create({
      epcPartner:        enquiry.epcPartner,
      enquiry:           enquiry._id,
      customerName:      enquiry.customerName,
      customerMobile:    enquiry.customerMobile,
      customerEmail:     enquiry.customerEmail,
      projectType:       enquiry.projectType,
      systemCapacityKw:  enquiry.systemCapacityKw,
      state:             enquiry.state,
      district:          enquiry.district,
      city:              enquiry.city,
      address:           enquiry.address,
      totalProjectValue: totalProjectValue || 0,
      payment90: {
        amount: totalProjectValue ? totalProjectValue * 0.9 : 0,
        status: 'Pending',
      },
      payment10: {
        amount: totalProjectValue ? totalProjectValue * 0.1 : 0,
        status: 'Pending',
      },
      stage:  'Registration Started',  // Fix: naya stage flow
      status: 'New',
      scheduledInstallDate,
      dueDateForCompletion,
    });

    enquiry.status           = 'Converted';
    enquiry.convertedToOrder = order._id;
    enquiry.convertedAt      = new Date();
    await enquiry.save();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('convertToOrder error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getMyEnquiries, getEnquiryById, acceptEnquiry, convertToOrder };