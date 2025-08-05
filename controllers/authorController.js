const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ msg: 'User already exists' });

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user);
  res.status(201).json({ user: { id: user._id, name: user.name, role: user.role }, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(400).json({ msg: 'Invalid credentials' });

  const token = generateToken(user);
  res.status(200).json({ user: { id: user._id, name: user.name, role: user.role }, token });
};
