import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_KEY = '@ai_challenge_username';

export const storage = {
  /**
   * Get stored username
   * @returns {Promise<string|null>} Username or null if not set
   */
  getUsername: async () => {
    try {
      const username = await AsyncStorage.getItem(USERNAME_KEY);
      return username;
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  },

  /**
   * Save username
   * @param {string} username - Username to save
   * @returns {Promise<boolean>} Success status
   */
  saveUsername: async (username) => {
    try {
      await AsyncStorage.setItem(USERNAME_KEY, username);
      return true;
    } catch (error) {
      console.error('Error saving username:', error);
      return false;
    }
  },

  /**
   * Clear username (logout)
   * @returns {Promise<boolean>} Success status
   */
  clearUsername: async () => {
    try {
      await AsyncStorage.removeItem(USERNAME_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing username:', error);
      return false;
    }
  }
};
