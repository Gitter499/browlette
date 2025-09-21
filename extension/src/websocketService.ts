import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8080';

interface WebSocketHookProps {
  onMessageCallback?: (message: any) => void;
}

export const useWebSocket = ({ onMessageCallback }: WebSocketHookProps = {}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const messageQueue = useRef<string[]>([]);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Send any queued messages
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        if (message) {
          ws.current?.send(message);
        }
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        setLastMessage(parsedMessage);
        if (onMessageCallback) {
          onMessageCallback(parsedMessage);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [onMessageCallback]); // Add onMessageCallback to dependency array

  const sendMessage = useCallback((message: any) => {
    const messageString = JSON.stringify(message);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(messageString);
    } else {
      messageQueue.current.push(messageString);
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
};
