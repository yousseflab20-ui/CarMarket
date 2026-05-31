import { queryClient } from "../lib/react-query";
import SocketService from "../service/SocketService";
import { useEffect } from "react";

export const useSocketNotifications = (userId?: number | string) => {
  useEffect(() => {
    if (!userId) return;

    const socketService = SocketService.getInstance();
    const socket = socketService.getSocket();

    // Register userId so SocketService can auto re-join room on reconnect
    socketService.setUserId(userId);
    socket.emit("user_online", userId.toString());

    const handler = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    };

    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };
  }, [userId]);
};