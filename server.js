Skip to content
leenasserariya5-pixel
NM-CONTACT-MANAGER
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Security
Insights
Commit 8e7df8b
leenasserariya5-pixel
leenasserariya5-pixel
authored
8 hours ago
Verified
Add files via upload
main
1 parent 
f558747
 commit 
8e7df8b
File tree
Filter files…
ConnectHub_.docx
Contact-Manager/server
package-lock.json
package.json
src
controllers
authController.js
contactController.js
dbConfig
dbConfig.js
middleware
authMiddleware.js
errorHandler.js
validation.js
models
Contact.js
User.js
routes
authRoutes.js
contactRoutes.js
server.js
utility
tokenGenerator.js
validators.js
Phase 1
Contact Manager - BrainStorming.docx
Contact Manager - Empathy Map.docx
Contact Manager- Problem Statement.docx
Phase 2
Contact Manager - DFD.docx
Contact Manager - Requirements.docx
Contact Manager - Tech Stack.docx
Phase 3
COntact Manager - Planning.docx
Phase 4
Contact Manager - Architecture.docx
Contact Manager - Proposed solution.docx
Contact Manager - solution fit.docx
Phase 5
Contact Manager - UAT.docx
WhatsApp Video 2026-03-06 at 12.01.48 PM (1).mp4
28 files changed
+2173
-0
lines changed
Search within code
 
‎ConnectHub_.docx‎
1.94 MB
Binary file not shown.
‎Contact-Manager/server/package-lock.json‎
+1,560
Lines changed: 1560 additions & 0 deletions
Some generated files are not rendered by default. Learn more about customizing how changed files appear on GitHub.
‎Contact-Manager/server/package.json‎
+25
Lines changed: 25 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,25 @@
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon src/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "compress-json": "^3.4.0",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "express-validator": "^7.3.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.2.1",
    "nodemon": "^3.1.11"
  }
}
‎Contact-Manager/server/src/controllers/authController.js‎
+92
Lines changed: 92 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,92 @@
import User from '../models/User.js';
import generateToken from '../utility/tokenGenerator.js';
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
  registerUser,
  loginUser,
  getMe,
};
‎Contact-Manager/server/src/controllers/contactController.js‎
+151
Lines changed: 151 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,151 @@
import Contact from '../models/Contact.js';
// @desc    Get all contacts for logged-in user
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this contact' });
    }
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res) => {
  try {
    const { name, email, phone, notes, tags } = req.body;
    const contact = await Contact.create({
      userId: req.user._id,
      name,
      email,
      phone,
      notes,
      tags: tags || [],
    });
    res.status(201).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this contact' });
    }
    const { name, email, phone, notes, tags } = req.body;
    contact.name = name || contact.name;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;
    contact.notes = notes || contact.notes;
    contact.tags = tags !== undefined ? tags : contact.tags;
    const updatedContact = await contact.save();
    res.json({ success: true, contact: updatedContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    // Check if contact belongs to user
    if (contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this contact' });
    }
    await contact.deleteOne();
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Search contacts
// @route   GET /api/contacts/search?q=searchTerm
// @access  Private
const searchContacts = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    const contacts = await Contact.find({
      userId: req.user._id,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
};
‎Contact-Manager/server/src/dbConfig/dbConfig.js‎
+14
Lines changed: 14 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,14 @@
import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;
‎Contact-Manager/server/src/middleware/authMiddleware.js‎
+37
Lines changed: 37 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,37 @@
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const authentication = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
export default authentication
‎Contact-Manager/server/src/middleware/errorHandler.js‎
+16
Lines changed: 16 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,16 @@
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
export { errorHandler, notFound };
‎Contact-Manager/server/src/middleware/validation.js‎
+18
Lines changed: 18 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,18 @@
import { validationResult } from 'express-validator';
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};
export default validate;
‎Contact-Manager/server/src/models/Contact.js‎
+43
Lines changed: 43 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,43 @@
import mongoose from "mongoose";
const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a contact name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
// Index for faster queries
contactSchema.index({ userId: 1 });
contactSchema.index({ name: 1 });
contactSchema.index({ tags: 1 });
export default mongoose.model('Contact', contactSchema);
‎Contact-Manager/server/src/models/User.js‎
+48
Lines changed: 48 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,48 @@
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.model('User', userSchema);
‎Contact-Manager/server/src/routes/authRoutes.js‎
+12
Lines changed: 12 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,12 @@
import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import  authentication  from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../utility/validators.js';
import validate from '../middleware/validation.js';
router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.get('/me', authentication, getMe);
export default router;
‎Contact-Manager/server/src/routes/contactRoutes.js‎
+25
Lines changed: 25 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,25 @@
import express from 'express';
const router = express.Router();
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
} from '../controllers/contactController.js';
import authentication from '../middleware/authMiddleware.js';
import { contactValidation, updateContactValidation } from '../utility/validators.js';
import validate from '../middleware/validation.js';
router.get('/search', authentication, searchContacts);
router.route('/')
  .get(authentication, getContacts)
  .post(authentication, contactValidation, validate, createContact);
router.route('/:id')
  .get(authentication, getContactById)
  .put(authentication, updateContactValidation, validate, updateContact)
  .delete(authentication, deleteContact);
export default router;
‎Contact-Manager/server/src/server.js‎
+39
Lines changed: 39 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,39 @@
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './dbConfig/dbConfig.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoute from './routes/authRoutes.js'
import contacrRoute from './routes/contactRoutes.js'
// Load environment variables
dotenv.config();
// Connect to database
connectDB();
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Routes
app.use('/api/auth', authRoute);
app.use('/api/contacts', contacrRoute);
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});
// Error handling middleware
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
‎Contact-Manager/server/src/utility/tokenGenerator.js‎
+9
Lines changed: 9 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,9 @@
import jwt from 'jsonwebtoken';
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
export default generateToken;
‎Contact-Manager/server/src/utility/validators.js‎
+84
Lines changed: 84 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,84 @@
import { body } from 'express-validator';
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
// CREATE validation - all fields required
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Contact name is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('notes').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];
// UPDATE validation - all fields optional, but at least one required
const updateContactValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Valid email format is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits'),
  
  body('notes')
    .optional()
    .isString()
    .trim(),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((value) => {
      if (value && value.some(tag => typeof tag !== 'string')) {
        throw new Error('All tags must be strings');
      }
      if (value && value.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  // Custom validator: At least one field must be provided
  body().custom((value, { req }) => {
    const updateFields = ['name', 'email', 'phone', 'notes', 'tags'];
    const hasAnyField = updateFields.some(field => field in req.body);
    
    if (!hasAnyField) {
      throw new Error('At least one field is required to update the contact');
    }
    return true;
  }).withMessage('At least one field is required to update the contact')
];
// Export both validations
export {
  registerValidation,
  loginValidation,
  contactValidation,
  updateContactValidation
};
‎Phase 1/Contact Manager - BrainStorming.docx‎
389 KB
Binary file not shown.
‎Phase 1/Contact Manager - Empathy Map.docx‎
490 KB
Binary file not shown.
‎Phase 1/Contact Manager- Problem Statement.docx‎
49.1 KB
Binary file not shown.
‎Phase 2/Contact Manager - DFD.docx‎
69 KB
Binary file not shown.
‎Phase 2/Contact Manager - Requirements.docx‎
10.7 KB
Binary file not shown.
‎Phase 2/Contact Manager - Tech Stack.docx‎
7.94 KB
Binary file not shown.
‎Phase 3/COntact Manager - Planning.docx‎
9.16 KB
Binary file not shown.
‎Phase 4/Contact Manager - Architecture.docx‎
195 KB
Binary file not shown.
‎Phase 4/Contact Manager - Proposed solution.docx‎
10.1 KB
Binary file not shown.
‎Phase 4/Contact Manager - solution fit.docx‎
191 KB
Binary file not shown.
‎Phase 5/Contact Manager - UAT.docx‎
146 KB
Binary file not shown.
‎WhatsApp Video 2026-03-06 at 12.01.48 PM (1).mp4‎
14.1 MB
Binary file not shown.
0 commit comments
Comments
0
 (0)
Comment
You're not receiving notifications from this thread.

9 files remain