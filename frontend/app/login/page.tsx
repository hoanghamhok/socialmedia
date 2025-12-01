"use client";
import { useState } from "react";
import API, { setAuthToken } from "../../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { username, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      setAuthToken(token);
      window.location.href = "/"; // redirect
    } catch (err: any) {
      alert(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="p-6 shadow rounded bg-white">
        <h1 className="text-xl mb-4">Login</h1>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="border p-2 w-64 mb-2" placeholder="username" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2 w-64 mb-4" placeholder="password" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
}
