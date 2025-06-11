import type { User } from "@/types/catalog"
import { useEffect, useState } from "react"

const UserInfo = () => {
  const [userData, setUserData] = useState<User | null>({
    id: 0,
    name: "Cargando...",
    email: "••••••••••••••",
    role: "WAITER",
    active: true,
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/user/getMyUser")
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    loadUserData()
  }, [])

  if (!userData) return null

  return (
    <section className="flex flex-col items-center">
      {userData.role === "ADMINISTRATOR" ? (
        <svg
          className="stroke-primary size-16 stroke-[1.5] mb-1"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 21v-2a4 4 0 0 1 4 -4h2" />
          <path d="M22 16c0 4 -2.5 6 -3.5 6s-3.5 -2 -3.5 -6c1 0 2.5 -.5 3.5 -1.5c1 1 2.5 1.5 3.5 1.5z" />
          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        </svg>
      ) : (
        <svg
          className="stroke-primary size-16 stroke-[1.5] mb-1"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
          <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
      )}
      <h2 className="font-medium">{userData.name}</h2>
      <p className="text-secondary-text text-sm">{userData.email}</p>
    </section>
  )
}

export default UserInfo
