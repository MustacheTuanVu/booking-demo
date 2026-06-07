import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL;

const useSocket = (token: string): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Sử dụng 'auth' thay vì 'query'
    const newSocket: Socket = io(SOCKET_SERVER_URL, {
      auth: { token },
    });
    setSocket(newSocket);

    // Ngắt kết nối khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return socket;
};

export default useSocket;
