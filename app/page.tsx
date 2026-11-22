import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LoginButton } from "@/components/LoginButton"
import { Dashboard } from "@/components/Dashboard"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Habit Tracker</h1>
        {!session ? <LoginButton /> : <Dashboard />}
      </div>
    </main>
  )
}