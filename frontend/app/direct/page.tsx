// direct/page.tsx
"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";


export default function DirectPage() {
const [messages, setMessages] = useState([
{ from: "me", text: "Hello!" },
{ from: "other", text: "Hi, what's up?" }
]);
const [input, setInput] = useState("");


const sendMessage = () => {
if (!input.trim()) return;
setMessages([...messages, { from: "me", text: input }]);
setInput("");
};


return (
<div className="h-screen flex flex-col bg-white">
<div className="p-4 shadow text-lg font-semibold">Direct Messages</div>


<div className="flex-1 overflow-y-auto p-4 space-y-3">
{messages.map((m, i) => (
<motion.div
key={i}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className={`max-w-xs px-3 py-2 rounded-2xl shadow text-sm ${
m.from === "me"
? "bg-blue-500 text-white ml-auto"
: "bg-gray-200 text-black mr-auto"
}`}
>
{m.text}
</motion.div>
))}
</div>


<div className="p-3 flex gap-2 border-t">
<input
className="flex-1 p-2 border rounded-xl"
value={input}
onChange={(e) => setInput(e.target.value)}
placeholder="Message..."
/>
<button
onClick={sendMessage}
className="p-3 rounded-full shadow bg-blue-500 text-white"
>
<Send size={18} />
</button>
</div>
</div>
);
}