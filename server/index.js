/* ================================= SETUP ================================= */

require('dotenv').config();

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const dbConfig = require('./db')[ENV];

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

module.exports = { io };
const socketManager = require('./services/socketManager');

// initialize passport
require('./services/passportConfig');


/* ============================== MIDDLEWARE =============================== */
app.use('/',express.static(path.join(__dirname, '../client/build')));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// set up session cookies
app.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY],
}));

app.use(passport.initialize());
app.use(passport.session());


/* ================================ ROUTERS ================================ */

app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));


/* ======================= CONNECT TO DB AND STARTUP ======================= */

mongoose.connect(dbConfig.url)
  .then(() => {
    console.log(`Connected to ${dbConfig.url}`);
    http.listen(PORT, () => console.log('Server listening on port:', PORT));
    io.on('connection', socketManager);
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

mongoose.set('debug', true);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
