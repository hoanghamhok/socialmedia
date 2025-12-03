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
    <div className="hidden lg:flex flex-col w-80 py-4 sticky top-0 h-screen space-y-2 border-r">
      <h2 className="text-gray-500 text-sm font-semibold px-2">Chat</h2>
      {chatUsers.map(user => (
        <div
          key={user.id}
          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => openChatBox(user)}
        >
          <div className="flex flex-col">
            <span className="font-semibold">{user.fullName}</span>
            <span className="text-xs text-gray-400">{user.username}</span>
          </div>
          {user.unread && user.unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{user.unread}</span>
          )}
        </div>
      ))}
      {openChat && <ChatBox user={openChat} connection={connection} onClose={() => setOpenChat(null)} />}
    </div>
  );
}
