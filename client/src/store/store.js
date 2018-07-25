import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
// import logger from 'redux-logger';
import rootReducer from '../Reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk),
);

export default store;
