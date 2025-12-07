"use client";

import { useEffect, useState } from "react";
import { createChatConnection } from "@/services/signalr";
import ChatBox from "../../components/ChatBox";

interface ChatUser {
  id: string;
  fullName: string;
  username: string;
  unread?: number;
}

export default function ChatSidebar() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [openChat, setOpenChat] = useState<ChatUser | null>(null);
  const [connection, setConnection] = useState<any>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch all users
  useEffect(() => {
    fetch("http://localhost:5184/api/Users")
      .then(res => res.json())
      .then(data => setChatUsers(data.map((u: any) => ({ ...u, unread: 0 }))))
      .catch(console.error);
  }, []);

  // Fetch unread counts
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5184/api/Messages/unread/${userId}`)
      .then(res => res.json())
      .then(data => setChatUsers(prev => prev.map(u => ({ ...u, unread: data[u.id] || 0 }))))
      .catch(console.error);
  }, [userId]);

  // Setup SignalR
  useEffect(() => {
    if (!userId) return;
    const conn = createChatConnection();
    if (!conn) return;

    setConnection(conn);

    conn.start()
      .then(() => console.log("SignalR connected"))
      .catch(console.error);

    conn.on("ReceiveMessage", (msg: any) => {
      setChatUsers(prev =>
        prev.map(u =>
          u.id === msg.senderId
            ? { ...u, unread: (u.unread || 0) + 1 }
            : u
        )
      );
    });

    return () => { conn.stop(); conn.off("ReceiveMessage"); };
  }, [userId]);

  const openChatBox = (user: ChatUser) => {
    setOpenChat(user);
    setChatUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, unread: 0 } : u))
    );

    // Mark as read in backend
    if (connection) {
      connection.invoke("MarkAsRead", user.id, userId).catch(console.error);
    }
  };

  return (
    <div className="hidden lg:flex flex-col w-72 py-4 sticky top-0 h-screen border-r overflow-y-auto bg-white">
      {/* Header giống Instagram */}
      <h2 className="text-center text-base font-semibold border-b pb-2">Direct</h2>

      {/* Danh sách user */}
      {chatUsers.map(user => (
        <div
          key={user.id}
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all
            ${openChat?.id === user.id ? "border-l-4 border-pink-500 bg-gray-50" : "hover:bg-gray-100"}`}
          onClick={() => openChatBox(user)}
        >
          {/* Avatar + Info */}
          <div className="flex items-center space-x-3">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
              alt={user.fullName}
              className="w-10 h-10 rounded-full border"
            />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.fullName}</span>
              <span className="text-xs text-gray-400">@{user.username}</span>
            </div>
          </div>

          {/* Badge unread gradient */}
          {user.unread && user.unread > 0 && (
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
              {user.unread}
            </span>
          )}
        </div>
      ))}

      {/* ChatBox */}
      {openChat && (
        <ChatBox
          user={openChat}
          connection={connection}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  );
}
