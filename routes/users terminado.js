
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator'); // Para Express Validator
// ox   
const joi = require('joi'); // Para Joi
const flash = require('express-flash');

const router = express.Router();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String, // Asegúrate de que el campo "password" esté presente
});

const User = mongoose.model('User', userSchema);

/* Express Validator */
const validateUser = [
    check('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    check('email').isEmail().withMessage('El correo electrónico no es válido'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
];



router.get('/', async (req, res) => {
    const users = await User.find();
    res.render('index', { users });
});

//Bcrypt
router.post('/', validateUser, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg); // Define mensajes flash de error
        });
        return res.redirect('/users');
    }
    const { name, email, password } = req.body;
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
