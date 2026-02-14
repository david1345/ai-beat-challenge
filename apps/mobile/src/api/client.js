import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  /**
   * Start a new game
   * @param {string} username - User's username
   * @param {string} mode - Game mode (FLASH, SPEED, STANDARD)
   * @returns {Promise} Game data with game_id and rounds
   */
  startGame: async (username, mode) => {
    const response = await apiClient.post('/api/game/start', {
      username,
      mode
    });
    return response.data;
  },

  /**
   * Submit user predictions for a game
   * @param {string} gameId - Game ID
   * @param {Array} predictions - Array of {round_id, direction}
   * @returns {Promise} Submission confirmation
   */
  submitPredictions: async (gameId, predictions) => {
    const response = await apiClient.post('/api/game/submit', {
      game_id: gameId,
      predictions
    });
    return response.data;
  },

  /**
   * Warm AI predictions in background while user is selecting.
   * @param {string} gameId - Game ID
   */
  warmAIPredictions: async (gameId) => {
    const response = await apiClient.post('/api/game/predict', {
      game_id: gameId
    });
    return response.data;
  },

  /**
   * Get game result
   * @param {string} gameId - Game ID
   * @returns {Promise} Game result with scores and rounds
   */
  getResult: async (gameId) => {
    const response = await apiClient.get('/api/game/result', {
      params: { game_id: gameId }
    });
    return response.data;
  },

  /**
   * Get user profile
   * @param {string} username - User's username
   * @returns {Promise} User profile data
   */
  getUserProfile: async (username) => {
    const response = await apiClient.get('/api/user/profile', {
      params: { username }
    });
    return response.data;
  },

  /**
   * Get user game history
   * @param {string} username - User's username
   * @param {number} limit - Number of games to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise} Array of games
   */
  getUserHistory: async (username, limit = 20, offset = 0) => {
    const response = await apiClient.get('/api/user/history', {
      params: { username, limit, offset }
    });
    return response.data;
  },

  /**
   * Get user predictions timeline (pending + completed)
   * @param {string} username
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise} Prediction entries
   */
  getUserPredictions: async (username, limit = 20, offset = 0) => {
    const response = await apiClient.get('/api/user/predictions', {
      params: { username, limit, offset }
    });
    return response.data;
  }
};
