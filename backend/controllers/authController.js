const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/jwtUtils');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Never allow public registration to create an administrator account.
    if (!['rider', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Role must be rider or driver' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const hashed = await hashPassword(password);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(400).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = generateToken({ userId: user._id, role: user.role });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(400).json({ error: 'Login failed' });
  }
};
