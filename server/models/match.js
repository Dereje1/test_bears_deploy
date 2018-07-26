/* ================================= SETUP ================================= */

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


/* ================================ SCHEMA ================================= */

const matchSchema = new mongoose.Schema({
  difficulty: { type: Number, min: 1, max: 4 },
  multiPlayer: { type: Boolean, default: false, required: true },
  players: [
    {
      name: { type: String, required: true },
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      score: Number,
      winner: Boolean,
    },
  ],
  ts: { type: Number, default: Date.now },
});


/* ============================ SCHEMA METHODS ============================= */

matchSchema.statics.getAllBestSPScores = function getAllBestSPScores() {
  return this.aggregate([
    { $match: { multiPlayer: false } },
    { $unwind: '$players' },
    {
      $group: {
        _id: { playerId: '$players._id', name: '$players.name' },
        bestScore: { $max: '$players.score' },
      },
    },
    {
      $project: {
        _id: '$_id.playerId',
        name: '$_id.name',
        bestScore: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);
};

matchSchema.statics.getSinglePlayerLeaders = function getSPLeaders(limit) {
  return this.aggregate([
    { $match: { multiPlayer: false } },
    { $unwind: '$players' },
    { $sort: { 'players.score': -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        name: '$players.name',
        score: '$players.score',
      },
    },
  ]);
};

matchSchema.statics.getMultiPlayerLeaders = function getMPLeaders(limit) {
  return this.aggregate([
    { $match: { multiPlayer: true } },
    { $unwind: '$players' },
    { $match: { 'players.winner': true } },
    {
      $group: {
        _id: { name: '$players.name' },
        wins: { $sum: 1 },
      },
    },
    { $sort: { wins: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        name: '$_id.name',
        wins: 1,
      },
    },
  ]);
};

matchSchema.statics.getOwnRecentMatches = function getOwnRecentMatches(
  player,
  limit,
) {
  return this.aggregate([
    { $match: { 'players._id': ObjectId(player) } },
    { $sort: { ts: -1 } },
    {
      $group: {
        _id: { multiPlayer: '$multiPlayer' },
        matches: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        matches: { $slice: ['$matches', limit] },
      },
    },
    {
      $project: {
        'matches._id': 0,
        'matches.multiPlayer': 0,
        'matches.__v': 0,
      },
    },
  ]);
};

matchSchema.statics.getOwnStats = function getOwnMPStats(player) {
  return this
    .find(
      { 'players._id': player },
      { __v: 0 },
    )
    .sort({ ts: -1 })
    .then((docs) => {
      const initialSpStats = {
        games_played: 0,
        best_score: null,
        worst_score: null,
        last_ten_games: [],
      };

      const initialMpStats = {
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        last_ten_games: [],
      };

      const spStats = docs.reduce((acc, doc) => {
        const p = doc.players[0];
        if (doc.multiPlayer === false) {
          acc.games_played += 1;

          acc.best_score = (p.score > acc.best_score)
            ? p.score
            : acc.best_score;

          acc.worst_score = (!acc.worst_score || p.score < acc.worst_score)
            ? p.score
            : acc.worst_score;

          if (acc.last_ten_games.length < 10) {
            acc.last_ten_games.push({
              _id: doc._id,
              ts: doc.ts,
              score: doc.players[0].score,
            });
          }
        }
        return acc;
      }, initialSpStats);

      const mpStats = docs.reduce((acc, doc) => {
        if (doc.multiPlayer === true) {
          acc.games_played += 1;

          if (doc.players.some(p => p._id.equals(player) && p.winner)) {
            acc.games_won += 1;
          } else {
            acc.games_lost += 1;
          }

          if (acc.last_ten_games.length < 10) {
            acc.last_ten_games.push(doc);
          }
        }
        return acc;
      }, initialMpStats);

      return { spStats, mpStats };
    });
};

matchSchema.statics.saveMatch = function saveMatch(match) {
  /**
   * ADD CUSTOM VALIDATION HERE
   */
  return this.create(match);
};

/* ================================ EXPORTS ================================ */

module.exports = mongoose.model('Match', matchSchema);
