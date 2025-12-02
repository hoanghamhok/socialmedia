"use client";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Search, Home, PlusSquare, User } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState({ username: "yourusername", avatar: "" });

  useEffect(() => {
    // In real app: check token and fetch feed
    // const token = sessionStorage.getItem("token");
    // if (token) setAuthToken(token);
    fetchFeed();
  }, []);

  async function fetchFeed() {
    try {
      // Demo data - replace with real API call
      const demoData = [
        {
          id: 1,
          user: { username: "travel_explorer", avatar: "", isFollowing: false },
          image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
          likes: 1234,
          isLiked: false,
          isSaved: false,
          caption: "Amazing sunset at the mountains! 🏔️✨",
          comments: [
            { user: "nature_lover", text: "Absolutely stunning!" },
            { user: "photo_fan", text: "Where is this place?" }
          ],
          timeAgo: "2 hours ago"
        },
        {
          id: 2,
          user: { username: "foodie_adventures", avatar: "", isFollowing: true },
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
          likes: 856,
          isLiked: true,
          isSaved: false,
          caption: "Homemade pasta night 🍝 Recipe in bio!",
          comments: [
            { user: "chef_mike", text: "Looks delicious! 😋" }
          ],
          timeAgo: "5 hours ago"
        },
        {
          id: 3,
          user: { username: "fitness_journey", avatar: "", isFollowing: false },
          image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
          likes: 2103,
          isLiked: false,
          isSaved: true,
          caption: "Morning workout complete! 💪 #fitness #motivation",
          comments: [],
          timeAgo: "1 day ago"
        }
      ];
      setPosts(demoData);
    } catch (err) {
      console.error(err);
    }
  }

  function handleLike(postId: number) {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  }

  function handleSave(postId: number) {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isSaved: !p.isSaved } : p
    ));
  }

  function handleFollow(postId: number) {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, user: { ...p.user, isFollowing: !p.user.isFollowing } } : p
    ));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SocialApp
          </h1>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-6">
            <Home className="w-6 h-6 cursor-pointer hover:text-gray-600" />
            <PlusSquare className="w-6 h-6 cursor-pointer hover:text-gray-600" />
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full cursor-pointer"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stories Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <div className="flex gap-4">
              {["Your Story", "user1", "user2", "user3", "user4", "user5"].map((username, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 cursor-pointer min-w-fit">
                  <div className={`w-16 h-16 rounded-full p-0.5 ${idx === 0 ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 truncate w-16 text-center">
                    {idx === 0 ? "Your Story" : username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-sm">{post.user.username}</p>
                    <p className="text-xs text-gray-500">{post.timeAgo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!post.user.isFollowing && (
                    <button 
                      onClick={() => handleFollow(post.id)}
                      className="text-blue-500 font-semibold text-sm hover:text-blue-600"
                    >
                      Follow
                    </button>
                  )}
                  <MoreHorizontal className="w-5 h-5 cursor-pointer text-gray-600" />
                </div>
              </div>

              {/* Post Image */}
              <div className="w-full aspect-square bg-gray-100">
                <img 
                  src={post.image} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Post Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart 
                      className={`w-6 h-6 cursor-pointer transition-all ${post.isLiked ? 'fill-red-500 text-red-500' : 'hover:text-gray-600'}`}
                      onClick={() => handleLike(post.id)}
                    />
                    <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                    <Send className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                  </div>
                  <Bookmark 
                    className={`w-6 h-6 cursor-pointer ${post.isSaved ? 'fill-current' : 'hover:text-gray-600'}`}
                    onClick={() => handleSave(post.id)}
                  />
                </div>

                {/* Likes Count */}
                <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>

                {/* Caption */}
                <p className="text-sm">
                  <span className="font-semibold mr-2">{post.user.username}</span>
                  {post.caption}
                </p>

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="space-y-1">
                    <button className="text-sm text-gray-500">
                      View all {post.comments.length + 10} comments
                    </button>
                    {post.comments.slice(0, 2).map((comment: any, idx: number) => (
                      <p key={idx} className="text-sm">
                        <span className="font-semibold mr-2">{comment.user}</span>
                        {comment.text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex items-center gap-2 border-t pt-3">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="flex-1 outline-none text-sm"
                  />
                  <button className="text-blue-500 font-semibold text-sm hover:text-blue-600">
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Suggestions */}
        <div className="hidden lg:block space-y-6">
          {/* Current User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">{currentUser.username}</p>
                <p className="text-xs text-gray-500">Your Profile</p>
              </div>
            </div>
            <button className="text-blue-500 font-semibold text-xs hover:text-blue-600">
              Switch
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-500">Suggestions For You</p>
              <button className="text-xs font-semibold hover:text-gray-600">See All</button>
            </div>
            
            <div className="space-y-4">
              {["photo_lover", "art_daily", "tech_guru", "music_vibes", "book_worm"].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-sm">{user}</p>
                      <p className="text-xs text-gray-500">Followed by user123 + 2 more</p>
                    </div>
                  </div>
                  <button className="text-blue-500 font-semibold text-xs hover:text-blue-600">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-xs text-gray-400 space-y-2">
            <div className="flex flex-wrap gap-2">
              <a href="#" className="hover:underline">About</a>
              <span>·</span>
              <a href="#" className="hover:underline">Help</a>
              <span>·</span>
              <a href="#" className="hover:underline">Press</a>
              <span>·</span>
              <a href="#" className="hover:underline">API</a>
              <span>·</span>
              <a href="#" className="hover:underline">Jobs</a>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}