// profile/page.tsx
"use client";
import { motion } from "framer-motion";
import { useState } from "react";


export default function ProfilePage() {
const [stories] = useState([
{ id: 1, label: "Trip", img: "/story1.jpg" },
{ id: 2, label: "Food", img: "/story2.jpg" },
{ id: 3, label: "Pets", img: "/story3.jpg" }
]);


const [reels] = useState([
{ id: 1, video: "/reel1.mp4" },
{ id: 2, video: "/reel2.mp4" }
]);


return (
<div className="bg-white min-h-screen p-4 space-y-6">
{/* Header */}
<div className="flex items-center gap-4">
<div className="w-20 h-20 rounded-full bg-gray-300"></div>
<div>
<div className="text-xl font-semibold">username</div>
<div className="text-gray-500">Full Name</div>
</div>
</div>


{/* Stories UI */}
<div>
<div className="font-semibold text-lg mb-3">Stories</div>
<div className="flex gap-4 overflow-x-auto">
{stories.map((s) => (
<div key={s.id} className="flex flex-col items-center">
<div className="w-20 h-20 rounded-full border-4 border-pink-500 overflow-hidden">
<img src={s.img} alt={s.label} className="w-full h-full object-cover" />
</div>
<div className="text-sm mt-1">{s.label}</div>
</div>
))}
</div>
</div>


{/* Reels UI */}
<div>
<div className="font-semibold text-lg mb-3">Reels</div>
<div className="grid grid-cols-2 gap-4">
{reels.map((r) => (
<motion.video
key={r.id}
src={r.video}
className="w-full h-64 object-cover rounded-xl shadow"
autoPlay
loop
muted
whileHover={{ scale: 1.03 }}
/>
))}
</div>
</div>
</div>
);
}