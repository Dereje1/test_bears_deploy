/* ================================= SETUP ================================= */

const router = require('express').Router();
const { getUserProfile } = require('../controllers/profileCtrl');
const {
  getLeaderboard,
  getPlayersBestScores,
  getUsersOwnStats,
  saveMatch,
} = require('../controllers/matchCtrl');
const { seedMatches } = require('../controllers/dbSeed');

/* =============================== MIDDLEWARE ============================== */

// Auth route middleware, checks if a user is logged in or not
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  // if not authenticated then ...populate the client profile page accordingly
  const headerObject = req.headers;
  /*
  the x-forwarded-for property of the header does not appear for local host so
  add an alternative or will error out locally on split to get the ip address
  the rest of the requests are common to loacl and remote
  */
  let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
  ip = (ip === '::1') ? 'local' : ip;
  res.json({
    authenticated: false,
    userip: ip,
    username: null,
    displayname: null,
    email: null,
    authenticationService: null,
  });
  return false;
};


/* ================================ ROUTES ================================= */

// Authentication result  route for client side consumption
router.get('/profile', isLoggedIn, getUserProfile);

router.get('/leaderboard', getLeaderboard);

router.get('/best_scores', getPlayersBestScores);

router.get('/my_stats', isLoggedIn, getUsersOwnStats);

router.post('/save_match', saveMatch);

// Development route - seeds DB with fake matches
router.get('/seed_matches', seedMatches);

/* ================================ EXPORTS ================================ */

module.exports = router;
