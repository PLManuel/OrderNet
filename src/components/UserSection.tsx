import { useEffect, useState } from "react"
import UserUpdateModal from "./UserUpdateModal"

type Role = "ADMINISTRATOR" | "WAITER"

interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
}

export default function UserSection() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/getMyUser")
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          console.error("Error al obtener datos del usuario")
        }
      } catch (err) {
        console.error("Error de red:", err)
      }
    }

    fetchUser()
  }, [])

  if (!user) {
    return (
      <div className="p-6 text-gray-500 italic">
        Cargando información del usuario...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 flex justify-between bg-gradient-to-r from-blue-600 to-blue-700">
        <div>
          <h2 className="text-xl font-bold text-white">Ajustes de Usuario</h2>
          <p className="text-blue-100 text-sm mt-1">
            Gestiona tu información personal
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden h-fit">
          <UserUpdateModal userId={user?.id} />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Información Personal
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border">
                    {user.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Información del Sistema
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ID de Usuario
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border">
                    {user.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-md border">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === "ADMINISTRATOR"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "ADMINISTRATOR"
                        ? "Administrador"
                        : "Mesero"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Información de Seguridad
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Para cambiar tu contraseña o información sensible, utiliza
                    el botón "Editar Perfil". Los cambios requieren confirmación
                    por seguridad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
