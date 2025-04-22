const express = require('express');
const path = require('path');
const qrRoutes = require('./routes/qrRoutes');
const session = require('express-session');
const flash = require('connect-flash');


const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session and Flash
app.use(session({
  secret: 'qr-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Flash to locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', qrRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
