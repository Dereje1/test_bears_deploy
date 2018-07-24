/* ================================= SETUP ================================= */

const Match = require('../models/match');


/* ============================== CONTROLLERS ============================== */

/**
 * Get leaderboard data
 * Example: GET >> /api/leaderboard
 * Secured: no
 * Expects:
 *    1) req.query.limit   {Number}   Optional num of matches. Default: 10
 * Returns: JSON object with arrays for top single player scores & most
 * multi-player wins
*/
const getLeaderboard = (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  Promise.all([
    Match.getSinglePlayerLeaders(limit),
    Match.getMultiPlayerLeaders(limit),
  ])
    .then(([spScores, mpScores]) => res.json({ spScores, mpScores }))
    .catch(err => next(err));
};

/**
 * Get all players' top single-player scores
 * Example: GET >> /api/best_scores
 * Secured: no
 * Expects: nothing
 * Returns: JSON array of all players' best single-player scores
*/
const getPlayersBestScores = (req, res, next) => {
  Match.getAllBestSPScores()
    .then(bestScores => res.json(bestScores))
    .catch(err => next(err));
};

/**
 * Get single player's own match statistics
 * Example: GET >> /api/my_stats
 * Secured: yes
 * Expects:
 *    1) req.user._id      {Object}   Player's user _id as Mongo ObjectID
 * Returns: JSON object of single player high/low scores, games played, and
 *    multiplayer games played, wins/losses
*/
const getUsersOwnStats = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }
  const playerId = req.user._id;

  return Match.getOwnStats(playerId)
    .then(stats => res.json(stats))
    .catch(err => next(err));
};


/* ================================ EXPORTS ================================ */

module.exports = {
  getLeaderboard,
  getPlayersBestScores,
  getUsersOwnStats,
};
