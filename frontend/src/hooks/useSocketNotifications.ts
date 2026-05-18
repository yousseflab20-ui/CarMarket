import { queryClient } from "../lib/react-query";
import SocketService from "../service/SocketService";
import { useEffect } from "react";

export const useSocketNotifications = (userId?: number | string) => {
  useEffect(() => {
  if (!userId) return;

  const socket = SocketService.getInstance().getSocket();

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