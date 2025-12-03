import * as signalR from "@microsoft/signalr";

export const createChatConnection = () => {
  if (typeof window === "undefined") return null;

  const userId = localStorage.getItem("userId");
  if (!userId) return null;

  return new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:5184/hubs/chat?userId=${userId}`)
    .withAutomaticReconnect()
    .build();
};
