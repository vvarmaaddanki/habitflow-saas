"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export function LoginButton() {
  const [email, setEmail] = useState("")

  const handleLogin = () => {
    signIn("credentials", {
      email,
      password: "demo",
      callbackUrl: "/dashboard"
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <input
        type="email"
        placeholder="your@email.com"
        className="w-full p-3 border rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
      >
        Sign In
      </button>
      <p className="text-xs text-gray-500 mt-2">Demo login (enter any email, password: "demo")</p>
    </div>
  )
}