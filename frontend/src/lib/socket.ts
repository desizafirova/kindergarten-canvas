/**
 * Socket.io Client Connection for Real-Time Preview
 * Manages WebSocket connection to backend with JWT authentication
 */

import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './auth';

// Convert HTTP URL to WebSocket URL
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3344';
  return apiUrl.replace(/^http/, 'ws');
};

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

/**
 * Get or create Socket.io client instance
 * @returns Socket.io client instance
 */
export function getSocket(): Socket {
  if (!socket) {
    const token = getAccessToken();

    socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      autoConnect: false, // Manual connection control
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
    });
  }

  return socket;
}

/**
 * Disconnect and clean up socket instance
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
