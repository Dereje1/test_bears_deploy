import React from 'react';
import PropTypes from 'prop-types';
import './controls.css';
/* font awesome */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faPause, faPlay, faUsers, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';

/* adds font awesome icons */
library.add(faPowerOff, faPause, faPlay);

const Controls = (props) => {
  if (!props.multiPlayer) {
    return (
      <div className="controls">
        <canvas
          ref={props.onCanvas}
          width={props.game.canvas.canvasMinor.width}
          height={props.game.canvas.canvasMinor.height}
          tabIndex="0"
        />

        <FontAwesomeIcon
          className="reset"
          icon={faPowerOff}
          onClick={() => props.onReset(false)}
        />
        <FontAwesomeIcon
          className="multiplayer"
          icon={faUsers}
          onClick={props.onMultiPlayer()}
        />
        {
          props.game.paused ?
            <FontAwesomeIcon
              className="play"
              icon={faPlay}
              onClick={props.onhandlePause()}
            />
            :
            <FontAwesomeIcon
              className="pause"
              icon={faPause}
              onClick={props.onhandlePause()}
            />
        }

        <button onClick={() => props.onFloorRaise()}>
          Raise Floor
        </button>
        <label htmlFor="test">Lines Cleared</label>
        <label htmlFor="test">{props.game.points.totalLinesCleared}</label>
        <label htmlFor="test">Level</label>
        <label htmlFor="test">{props.game.points.level}</label>
      </div>

    );
  }

  return (
    <div className="controls">
      <canvas
        ref={props.onCanvas}
        width={props.game.canvas.canvasMinor.width}
        height={props.game.canvas.canvasMinor.height}
        tabIndex="0"
      />
      <FontAwesomeIcon
        className="multiplayer"
        icon={faArrowCircleLeft}
        onClick={props.onMultiPlayer()}
      />
      <label htmlFor="test">Lines Cleared</label>
      <label htmlFor="test">{props.game.points.totalLinesCleared}</label>
      <label htmlFor="test">Difficulty</label>
      <label htmlFor="test">{props.difficulty}</label>
      {
        props.socketId ?
          <label className="socket" htmlFor="test">{props.socketId}</label>
          :
          null
      }
    </div>

  );
};

Controls.defaultProps = {
  onReset: null,
  onFloorRaise: null,
  onhandlePause: null,
  game: {},
  onCanvas: null,
  onMultiPlayer: null,
  multiPlayer: false,
  difficulty: 2,
  socketId: '',
};
Controls.propTypes = {
  onReset: PropTypes.func,
  onFloorRaise: PropTypes.func,
  onhandlePause: PropTypes.func,
  onMultiPlayer: PropTypes.func,
  game: PropTypes.objectOf(PropTypes.any),
  onCanvas: PropTypes.objectOf(PropTypes.any),
  multiPlayer: PropTypes.bool,
  difficulty: PropTypes.number,
  socketId: PropTypes.string,
};
export default Controls;
