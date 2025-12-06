import { StreamChat } from 'stream-chat';

let chatClient = null;

/**
 * Get or create Stream Chat client instance
 * @param {string} apiKey - Stream Chat API Key
 * @returns {StreamChat} - Stream Chat client instance
 */
export function getClientInstance(apiKey) {
  if (!chatClient) {
    if (!apiKey) {
      throw new Error('Stream Chat API Key is required');
    }
    chatClient = StreamChat.getInstance(apiKey);
  }
  return chatClient;
}

/**
 * Connect user to Stream Chat
 * @param {string} apiKey - Stream Chat API Key
 * @param {string} userId - User ID
 * @param {string} token - Stream Chat token from backend
 * @param {object} userData - User data (name, image, etc.)
 * @returns {Promise<StreamChat>} - Connected client
 */
export async function connectUser(apiKey, userId, token, userData = {}) {
  try {
    const client = getClientInstance(apiKey);
    
    const userObject = {
      id: userId,
      name: userData.name || 'User',
      image: userData.image || '',
      ...userData
    };

    await client.connectUser(userObject, token);
    console.log('✓ Stream Chat user connected:', userId);
    return client;
  } catch (error) {
    console.error('Error connecting to Stream Chat:', error);
    throw error;
  }
}

/**
 * Disconnect user from Stream Chat
 * @returns {Promise<void>}
 */
export async function disconnectUser() {
  try {
    if (chatClient) {
      // Don't set chatClient to null - just disconnect the user
      // This allows reconnection without recreating the client
      await chatClient.disconnectUser();
      console.log('✓ Stream Chat user disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting from Stream Chat:', error);
    // Don't throw - allow graceful disconnection
  }
}

/**
 * Get or create a channel
 * @param {string} channelId - Channel ID
 * @param {object} channelData - Channel data (name, members, etc.)
 * @returns {Promise<object>} - Channel object
 */
export async function getOrCreateChannel(channelId, channelData = {}) {
  try {
    if (!chatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const channel = chatClient.channel('messaging', channelId, {
      name: channelData.name || channelId,
      members: channelData.members || [],
      ...channelData
    });

    // Watch channel to subscribe to events
    await channel.watch();
    console.log('✓ Watching channel:', channelId);
    return channel;
  } catch (error) {
    console.error('Error getting/creating channel:', error);
    throw error;
  }
}

/**
 * Send a message to a channel
 * @param {object} channel - Channel object
 * @param {string} text - Message text
 * @param {object} messageData - Additional message data (including custom type)
 * @returns {Promise<object>} - Sent message
 */
export async function sendMessage(channel, text, messageData = {}) {
  try {
    if (!channel) {
      throw new Error('Channel not provided');
    }

    // Stream Chat only allows: '', 'regular', or 'system' as message.type
    // Store custom message type in a custom field instead
    const customType = messageData.type || 'normal';
    
    // Build the message object
    const messagePayload = {
      text,
      // Use empty string for Stream Chat's type field (default is 'regular')
      type: '',
      // Store custom type in custom data
      custom_type: customType
    };

    // Add any other custom data
    Object.keys(messageData).forEach(key => {
      if (key !== 'type') {
        messagePayload[key] = messageData[key];
      }
    });

    const message = await channel.sendMessage(messagePayload);

    console.log('✓ Message sent:', message.id, 'Type:', customType);
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Get message history from a channel
 * @param {object} channel - Channel object
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<array>} - Array of messages
 */
export async function getMessages(channel, limit = 50) {
  try {
    if (!channel) {
      throw new Error('Channel not provided');
    }

    const state = await channel.query({ messages: { limit } });
    return state.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Listen to new messages in a channel
 * @param {object} channel - Channel object
 * @param {function} callback - Callback function for new messages
 * @returns {function} - Unsubscribe function
 */
export function onMessageReceived(channel, callback) {
  if (!channel) {
    console.error('Channel not provided for message listener');
    return () => {};
  }

  const unsubscribe = channel.on('message.new', (event) => {
    callback(event.message);
  });

  return unsubscribe;
}

/**
 * Listen to message updates in a channel
 * @param {object} channel - Channel object
 * @param {function} callback - Callback function for message updates
 * @returns {function} - Unsubscribe function
 */
export function onMessageUpdated(channel, callback) {
  if (!channel) {
    console.error('Channel not provided for message update listener');
    return () => {};
  }

  const unsubscribe = channel.on('message.updated', (event) => {
    callback(event.message);
  });

  return unsubscribe;
}

/**
 * Listen to typing indicators
 * @param {object} channel - Channel object
 * @param {function} callback - Callback function for typing events
 * @returns {function} - Unsubscribe function
 */
export function onTypingIndicator(channel, callback) {
  if (!channel) {
    console.error('Channel not provided for typing indicator listener');
    return () => {};
  }

  const unsubscribe = channel.on('typing.start', (event) => {
    callback({ type: 'start', user: event.user });
  });

  channel.on('typing.stop', (event) => {
    callback({ type: 'stop', user: event.user });
  });

  return unsubscribe;
}

/**
 * Send typing indicator
 * @param {object} channel - Channel object
 * @returns {Promise<void>}
 */
export async function sendTypingIndicator(channel) {
  try {
    if (!channel) {
      throw new Error('Channel not provided');
    }
    await channel.keystroke();
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}

/**
 * Mark messages as read
 * @param {object} channel - Channel object
 * @param {string} messageId - Message ID to mark as read up to
 * @returns {Promise<void>}
 */
export async function markAsRead(channel, messageId) {
  try {
    if (!channel) {
      throw new Error('Channel not provided');
    }
    await channel.markRead({ message_id: messageId });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

/**
 * Get client instance (for advanced usage)
 * @returns {StreamChat|null} - Chat client or null if not initialized
 */
export function getClient() {
  return chatClient;
}

/**
 * Check if client is connected
 * @returns {boolean}
 */
export function isConnected() {
  return chatClient && chatClient.userID !== null;
}
