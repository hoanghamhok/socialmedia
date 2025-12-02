"use client";
import API from "../services/api";

export default function PostCard({ post, onLike }: any) {
  async function toggleLike() {
    try {
      await API.post(`/posts/${post._id || post.id}/like`);
      onLike();
    } catch (err) { console.error(err) }
  }

  return (
    <div className="border rounded mb-4 bg-white">
      <div className="p-3 flex items-center gap-3">
        <img src={post.userAvatar || "/default.png"} className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-semibold">{post.username}</div>
          <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <img src={post.imageUrl} className="w-full object-cover" />
      <div className="p-3">
        <div className="flex items-center gap-3">
          <button onClick={toggleLike} className="font-bold">{post.likes?.length || 0} 👍</button>
        </div>
        <div className="mt-2">
          <span className="font-semibold mr-2">{post.username}</span>{post.caption}
        </div>
      </div>
    </div>
  );
}
