import { useRef, useState, type FormEvent } from "react"

type Role = "WAITER" | "ADMINISTRATOR"

type UserFormData = {
  name: string
  email: string
  password: string
  role: Role
  active: boolean
}

const initialForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "ADMINISTRATOR",
  active: true,
}

const UserCreateModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [formData, setFormData] = useState<UserFormData>(initialForm)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Usuario creado exitosamente" })
        setFormData(initialForm)
        setTimeout(() => {
          dialogRef.current?.close()
          setMessage(null)
        }, 1000)
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al crear usuario",
        })
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsLoading(false)
      window.location.reload()
    }
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-fit py-2 px-3 rounded-lg flex items-center shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Crear nuevo
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 max-w-md w-full backdrop:bg-black/50 m-auto"
      >
        <form onSubmit={handleSubmit} method="dialog" className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Crear Nuevo Usuario
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

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

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre completo"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />

          <input
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />

          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="WAITER">Mesero</option>
            <option value="ADMINISTRATOR">Administrador</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>Usuario activo</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            >
              {isLoading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default UserCreateModal
