require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected!'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración de express-session
app.use(
  session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware de express-flash
app.use(flash());

app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.redirect('/users');
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}\nhttp://localhost:${process.env.PORT}`);
});
