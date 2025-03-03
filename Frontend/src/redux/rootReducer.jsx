import { combineReducers } from 'redux';
import authReducer from './authSlice'
import movieReducer from './movieSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  movies: movieReducer,
});

export default rootReducer;