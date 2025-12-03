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
  message: string;
  time: string;
}

export default function ChatBox({ user, connection, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connection) return;

    const receiveHandler = (msg: Message) => {
      if (msg.senderId === user.id || msg.senderId === localStorage.getItem("userId")) {
        setMessages(prev => [...prev, msg]);
      }
    };

    connection.on("ReceiveMessage", receiveHandler);

    return () => { connection.off("ReceiveMessage", receiveHandler); };
  }, [connection, user.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input || !connection) return;
    await connection.invoke("SendMessage", localStorage.getItem("userId"), user.id, input);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded shadow-lg flex flex-col h-96">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="font-semibold">{user.fullName}</span>
        <button onClick={onClose} className="text-gray-500">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded ${m.senderId === localStorage.getItem("userId") ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}>
            {m.message}
            <div className="text-xs text-gray-500">{new Date(m.time).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex border-t p-2 gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded p-1"
          placeholder="Type a message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 rounded">Send</button>
      </div>
    </div>
  );
}
