"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Search, Home, PlusSquare } from "lucide-react";
import { getFeed, getSuggestedUsers } from "@/services/api";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
    fetchSuggested();
  }, []);

  async function fetchFeed() {
    try {
      setLoading(true);
      const res = await getFeed();
      const feed = res.data || [];
      const mapped = feed.map((p: any) => ({
        id: p.id,
        user: { username: p.author?.username || "Unknown", avatar: p.author?.avatarUrl || "" },
        image: p.images?.[0] || "",
        likes: p.likesCount || 0,
        isLiked: p.isLiked || false,
        isSaved: false,
        caption: p.caption || "",
        commentsCount: p.commentsCount || 0,
        timeAgo: p.createdAt || "",
      }));
      setPosts(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuggested() {
    try {
      const res = await getSuggestedUsers();
      setSuggested(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleLike(postId: string) {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function handleSave(postId: string) {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar trái */}
      <div className="hidden lg:flex flex-col w-20 items-center py-4 sticky top-0 h-screen border-r border-gray-200 bg-white">
        <Home className="w-6 h-6 my-4 cursor-pointer hover:text-gray-600" />
        <MessageCircle className="w-6 h-6 my-4 cursor-pointer hover:text-gray-600" />
        <Search className="w-6 h-6 my-4 cursor-pointer hover:text-gray-600" />
        <PlusSquare className="w-6 h-6 my-4 cursor-pointer hover:text-gray-600" />
        <Heart className="w-6 h-6 my-4 cursor-pointer hover:text-gray-600" />
        <div className="w-8 h-8 my-4 bg-gray-300 rounded-full cursor-pointer"></div>
      </div>

      {/* Feed chính */}
      <div className="flex-1 max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Stories */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
          <div className="flex gap-4">
            {["Your Story", "user1", "user2", "user3"].map((username, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 cursor-pointer min-w-fit">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-16 text-center truncate">{username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading && <p>Loading...</p>}

        {!loading && posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">{post.user.username}</p>
                  <p className="text-xs text-gray-500">{post.timeAgo}</p>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-gray-200">
              <img src={post.image} className="w-full h-full object-cover" />
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Heart className={`w-6 h-6 cursor-pointer ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} onClick={() => handleLike(post.id)} />
                  <MessageCircle className="w-6 h-6 cursor-pointer" />
                  <Send className="w-6 h-6 cursor-pointer" />
                </div>
                <Bookmark className={`w-6 h-6 cursor-pointer ${post.isSaved ? "fill-current" : ""}`} onClick={() => handleSave(post.id)} />
              </div>

              <p className="font-semibold text-sm">{post.likes} likes</p>
              <p className="text-sm"><span className="font-semibold mr-2">{post.user.username}</span>{post.caption}</p>
              <p className="text-xs text-gray-400">{post.commentsCount} comments</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar phải */}
      <div className="hidden lg:flex flex-col w-80 ml-6 py-4 sticky top-0 right-10 h-screen space-y-4">
        <h2 className="text-gray-500 text-sm font-semibold text-center">Gợi ý cho bạn</h2>
        {suggested.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <p className="text-xs text-gray-400">{user.username}</p>
            </div>
            <button
              className={`text-blue-500 text-sm font-semibold ${user.isFollowing ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={user.isFollowing}
              onClick={() => user.isFollowing = true}
            >
              {user.isFollowing ? "Đã follow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
