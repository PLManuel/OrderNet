import type { User } from "@/types/catalog"
import { useRef, useState, type FormEvent } from "react"

type UserFormData = {
  name: string
  email: string
  password: string
  role: "WAITER" | "ADMINISTRATOR"
  active: boolean
}

const initialForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "ADMINISTRATOR",
  active: true,
}

interface UserUpdateModalProps {
  userId: number | undefined
  onUpdateSuccess?: () => void
  isAdmin?: boolean
}

const UserUpdateModal = ({
  userId,
  onUpdateSuccess,
  isAdmin,
}: UserUpdateModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [formData, setFormData] = useState<UserFormData>(initialForm)
  const [originalData, setOriginalData] = useState<User | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const loadUserData = async () => {
    setIsLoadingData(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/user/${userId}`)

      if (response.ok) {
        const userData: User = await response.json()
        setOriginalData(userData)
        setFormData({
          name: userData.name,
          email: userData.email,
          password: "",
          role: userData.role,
          active: userData.active,
        })
      } else {
        const errorData = await response.json()
        setMessage({
          type: "error",
          text: errorData.message || "Error al cargar los datos del usuario",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error de conexión al cargar los datos del usuario",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const openModal = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
      loadUserData()
    }
  }

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close()
    }
    setMessage(null)
    setFormData(initialForm)
    setOriginalData(null)
  }

  const getChangedFields = () => {
    if (!originalData) return {}

    const changes: any = { id: userId }

    if (formData.name !== originalData.name) {
      changes.name = formData.name
    }

    if (formData.email !== originalData.email) {
      changes.email = formData.email
    }

    if (formData.password.trim() !== "") {
      changes.password = formData.password
    }

    if (formData.role !== originalData.role) {
      changes.role = formData.role
    }

    if (formData.active !== originalData.active) {
      changes.active = formData.active
    }

    return changes
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const changedFields = getChangedFields()

      if (Object.keys(changedFields).length === 1) {
        setMessage({
          type: "error",
          text: "No se detectaron cambios para actualizar",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedFields),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Usuario actualizado exitosamente",
        })
        setTimeout(() => {
          closeModal()
          if (onUpdateSuccess){
            onUpdateSuccess()
          } else {
            window.location.reload()
          }
        }, 500)
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al actualizar usuario",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center w-full text-left bg-white px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
      >
        <span className="mr-3">✏️</span>
        Editar
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 max-w-md w-full backdrop:bg-black/50 m-auto"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal()
        }}
      >
        <form onSubmit={handleSubmit} method="dialog" className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Actualizar Usuario
            </h2>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {isLoadingData && (
            <div className="flex items-center justify-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="ml-2 text-gray-600">
                Cargando datos del usuario...
              </span>
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {!isLoadingData && originalData && (
            <>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nueva Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Dejar vacío para mantener la actual"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo completa si deseas cambiar la contraseña
                </p>
              </div>

              {isAdmin && (
                <>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Rol
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="WAITER">Mesero</option>
                      <option value="ADMINISTRATOR">Administrador</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Usuario activo
                    </span>
                  </label>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Usuario"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </dialog>
    </>
  )
}

export default UserUpdateModal
