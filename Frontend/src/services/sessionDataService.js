import { getApiUrl } from '../utils/apiUrl.js';

const API_BASE_URL = getApiUrl();

class SessionDataService {
  // Helper method for authenticated fetch requests
  async authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Fetch all completed sessions for the student
  async getCompletedSessions() {
    try {
      return await this.authenticatedFetch('/journal/sessions/completed');
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
      throw error;
    }
  }

  // Fetch AI analysis for a specific session
  async getSessionInsights(sessionId) {
    try {
      return await this.authenticatedFetch(`/ai/session-insights/${sessionId}`);
    } catch (error) {
      console.error('Error fetching session insights:', error);
      throw error;
    }
  }

  // Save notes for a specific session
  async saveSessionNotes(sessionId, notes) {
    try {
      return await this.authenticatedFetch('/journal/notes', {
        method: 'POST',
        body: JSON.stringify({ sessionId, notes })
      });
    } catch (error) {
      console.error('Error saving session notes:', error);
      throw error;
    }
  }

  // Get saved notes for a specific session
  async getSessionNotes(sessionId) {
    try {
      return await this.authenticatedFetch(`/journal/notes/${sessionId}`);
    } catch (error) {
      console.error('Error fetching session notes:', error);
      throw error;
    }
  }

  // Save complete journal entry (AI insights + notes)
  async saveJournalEntry(sessionId, insights, notes) {
    try {
      return await this.authenticatedFetch('/journal/entry', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          insights,
          notes,
          savedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  // Get all journal entries for the student
  async getJournalEntries() {
    try {
      return await this.authenticatedFetch('/journal/entries');
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }
}

export default new SessionDataService();
