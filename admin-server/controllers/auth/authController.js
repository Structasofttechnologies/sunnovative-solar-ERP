import User from '../../models/users/User.js';
import TemporaryIncharge from '../../models/hr/TemporaryIncharge.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, state, role } = req.body;

    if (!name || !email || !password || !phone || !state) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
      state,
      role: role || 'dealer',
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Log in with either email or phone (since we pass the mobile number in the 'email' field from the frontend login form)
    console.log("EMAIL:", email);

    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    }).populate('dynamicRole');
    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Check for active Temporary In-charge assignments
    const today = new Date();
    const activeAssignments = await TemporaryIncharge.find({
      tempInchargeUser: user._id,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    });

    const delegatedDepartments = activeAssignments.map(a => a.department);

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        delegatedDepartments, // Add this
        dynamicRole: user.dynamicRole,
        status: user.status,
        state: user.state,
      },
    });
    console.log(password);
console.log(user.password);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    }).populate('dynamicRole');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for active Temporary In-charge assignments
    const today = new Date();
    const activeAssignments = await TemporaryIncharge.find({
      tempInchargeUser: user._id,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).populate({
      path: 'department',
      populate: {
        path: 'assignedModules.module'
      }
    });

    const delegatedDepartments = activeAssignments.map(a => a.department);

    // Return user object with delegatedDepartments merged or as separate field
    // We'll attach it to the user object we send back
    const userObj = user.toObject();
    userObj.delegatedDepartments = delegatedDepartments;

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
