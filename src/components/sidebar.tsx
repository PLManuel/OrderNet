import { useEffect, useState } from "react"
import LogoutButton from "@/components/LogoutButton"
import UserInfo from "@/components/UserInfo"

type Role = "ADMINISTRATOR" | "WAITER"

interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
}

const allMenuItems = [
  { name: "Inicio", href: "/", icon: "home" },
  {
    name: "Usuarios",
    href: "/usuarios",
    icon: "users",
    restrictedTo: "ADMINISTRATOR",
  },
  { name: "Pedidos", href: "/pedidos", icon: "orders" },
  { name: "Catálogo", href: "/catalogo", icon: "catalog" },
  {
    name: "Mesas",
    href: "/mesas",
    icon: "tables",
    restrictedTo: "ADMINISTRATOR",
  },
  { name: "Ajustes", href: "/ajustes", icon: "settings" },
]

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/getMyUser")
        if (res.status === 401) {
          window.location.href = "/login"
          return
        }
        if (res.ok) {
          const data: User = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error("Error de red al obtener usuario:", err)
      }
    }

    fetchUser()
  }, [])

  if (!user) {
    return <div className="p-4 text-gray-500">Cargando menú...</div>
  }

  const visibleMenuItems = allMenuItems.filter((item) => {
    if (item.restrictedTo && item.restrictedTo !== user.role) {
      return false
    }
    return true
  })

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-64 transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 p-2.5">
      <div className="flex flex-col h-full bg-border rounded-3xl px-1.5 py-2.5">
        <UserInfo user={user} />

        <hr className="border mx-2 my-3 rounded-2xl" />

        <nav className="flex-1 overflow-y-auto mb-2.5 py-2 flex flex-col gap-2 px-5">
          {visibleMenuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="rounded-2xl flex items-center px-2 py-2.5 hover:bg-surface hover:text-primary transition-colors duration-300"
            >
              <span className="mr-3">
                {item.icon === "home" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                  </svg>
                )}
                {item.icon === "users" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                )}
                {item.icon === "orders" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 4l-8 4l8 4l8 -4l-8 -4" />
                    <path d="M4 12l8 4l8 -4" />
                    <path d="M4 16l8 4l8 -4" />
                  </svg>
                )}
                {item.icon === "catalog" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 4h6v6h-6z" />
                    <path d="M14 4h6v6h-6z" />
                    <path d="M4 14h6v6h-6z" />
                    <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  </svg>
                )}
                {item.icon === "tables" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                    <path d="M9 3l-6 6" />
                    <path d="M14 3l-7 7" />
                    <path d="M19 3l-7 7" />
                    <path d="M21 6l-4 4" />
                    <path d="M3 10h18" />
                    <path d="M10 10v11" />
                  </svg>
                )}
                {item.icon === "settings" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  </svg>
                )}
              </span>
              {item.name}
            </a>
          ))}
        </nav>

        <LogoutButton />
      </div>
    </div>
  )
}
