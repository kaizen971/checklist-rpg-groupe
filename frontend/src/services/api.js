import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  async setToken(token) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    await this.setToken(null);
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, data) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Guilds
  async getGuilds() {
    return this.request('/guilds');
  }

  async getGuild(guildId) {
    return this.request(`/guilds/${guildId}`);
  }

  async createGuild(data) {
    return this.request('/guilds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/tasks${params ? `?${params}` : ''}`);
  }

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Completions
  async completeTask(taskId, userId) {
    return this.request('/completions', {
      method: 'POST',
      body: JSON.stringify({ taskId, userId }),
    });
  }

  async getCompletions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/completions${params ? `?${params}` : ''}`);
  }

  // Quests
  async getQuests(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/quests${params ? `?${params}` : ''}`);
  }

  async createQuest(data) {
    return this.request('/quests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestProgress(questId) {
    return this.request(`/quests/${questId}/progress`, {
      method: 'PUT',
    });
  }

  // Stats
  async getUserStats(userId) {
    return this.request(`/stats/user/${userId}`);
  }

  async getLeaderboard(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/leaderboard${params ? `?${params}` : ''}`);
  }
}

export default new ApiService();
