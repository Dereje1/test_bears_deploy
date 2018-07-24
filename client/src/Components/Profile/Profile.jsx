import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUsersOwnStats } from '../../Actions/authentication';

import './Profile.css';

class Profile extends React.Component {

  componentDidMount() {
    this.props.actions.getUsersOwnStats();
  }

  render() {
    const { authenticated, displayName, stats } = this.props.user;
    return (
      <div className="profile">
        { authenticated ?
          <div className="profile__content">
            <div className="profile__header">
              <h1> { displayName } </h1>
              <a className="profile-logout__button" href="/auth/logout">
                Logout
              </a>
            </div>
            <div className="profile__card-container">
              <div className="profile__card">
                <h3 className="profile__heading">Single-Player Stats</h3>
                <p> Games Played: { stats.spStats.games_played } </p>
                <p> Best Score: { stats.spStats.best_score } </p>
                <p> Worst Score: { stats.spStats.worst_score } </p>
                <p> Last 10 Results: </p>
                <ul className="profile__card-list">
                  {
                    stats.spStats.last_ten_games.map(game => (
                      <li key={game._id}>
                        <p>
                          Score: { game.score }
                          <span className="profile__card-date">
                            ({ new Date(game.ts).toLocaleDateString() })
                          </span>
                        </p>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div className="profile__card">
                <h3 className="profile__heading">Multi-Player Stats</h3>
                <p> Games Played: { stats.mpStats.games_played } </p>
                <p> Games Won: { stats.mpStats.games_won } </p>
                <p> Games Lost: { stats.mpStats.games_lost } </p>
                <p> Last 10 Results: </p>
                <ul className="profile__card-list">
                  {
                    stats.mpStats.last_ten_games.map((game) => {
                      const winner = game.players.find(p => p.winner);
                      const loser = game.players.find(p => !p.winner);
                      const text = (winner._id === this.props.user._id)
                        ? `You beat ${loser.name}`
                        : `You lost to ${winner.name}`;
                      return (
                        <li key={game._id}>
                          <p>
                            { text } on level { game.difficulty }
                            <span className="profile__card-date">
                              ({ new Date(game.ts).toLocaleDateString() })
                            </span>
                          </p>
                        </li>);
                    })
                  }
                </ul>
              </div>
            </div>
          </div>
          :
          <div className="profile__content">
            <h1 className="profile__heading">
              You must authenticate to access this resource
            </h1>
          </div>
        }
      </div>
    );
  }

}

Profile.defaultProps = {
  user: null,
  actions: {},
};

Profile.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
  actions: PropTypes.shape({
    getUsersOwnStats: PropTypes.func,
  }),
};

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getUsersOwnStats,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
