const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Requiere la biblioteca bcrypt

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, 
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

//Bcrypt
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  // Genera un hash de la contraseña antes de almacenarla
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  res.redirect('/users');
});

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

//Bcrypt
router.post('/update/:id', async (req, res) => {
  const { name, email, password } = req.body;
  // Genera un nuevo hash de la contraseña si se proporciona una nueva contraseña
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.params.id, { name, email, password: hashedPassword });
  } else {
    await User.findByIdAndUpdate(req.params.id, { name, email });
  }
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
