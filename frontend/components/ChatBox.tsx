"use client";

import { useEffect, useRef, useState } from "react";
import { HubConnection } from "@microsoft/signalr";

interface ChatBoxProps {
  user: { id: string; fullName: string; username: string };
  connection: HubConnection | null;
  onClose: () => void;
}

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function ChatBox({ user, connection, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (!connection) return;

  const receiveHandler = (msg: any) => {
    const me = localStorage.getItem("userId");
    if (!me) return;

    const isMyChat =
      (msg.senderId === me && msg.receiverId === user.id) ||   // mình gửi cho nó
      (msg.senderId === user.id && msg.receiverId === me);     // nó gửi cho mình

    if (isMyChat) {
      setMessages(prev => [
        ...prev,
        {
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          message: msg.content,     // map từ BE -> FE
          time: msg.createdAt,
        },
      ]);
    }
  };

  connection.on("ReceiveMessage", receiveHandler);

  return () => {
    connection.off("ReceiveMessage", receiveHandler);
  };
}, [connection, user.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input || !connection) return;
    await connection.invoke("SendMessage", localStorage.getItem("userId"), user.id, input);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border rounded-xl shadow-lg flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
            alt={user.fullName}
            className="w-8 h-8 rounded-full border"
          />
          <span className="font-semibold text-sm">{user.fullName}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col">
        {messages.map((m, idx) => (
        <div
          key={idx}
          className={`max-w-[70%] p-2 rounded-2xl text-sm ${
            m.senderId === localStorage.getItem("userId")
              ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white self-end"
              : "bg-gray-200 text-black self-start"
          }`}
        >
          <div>{m.message}</div>
          <div className="text-[10px] text-gray-500 mt-1 text-right">
            {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center border-t p-2 gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          placeholder="Message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="text-pink-500 hover:text-pink-600 transition text-lg"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
