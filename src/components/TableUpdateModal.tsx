import { useRef, useState, type FormEvent } from "react"

type TableStatus = "AVAILABLE" | "OCCUPIED"

type Waiter = {
  id: number
  name: string
}

interface TableData {
  id: number
  code: string
  status: TableStatus
  userDTO: {
    id: number
    name: string
    email: string
    active: boolean
    role: "WAITER"
  } | null
}

interface TableUpdateModalProps {
  tableId: number | undefined
  onUpdateSuccess?: () => void
}

const TableUpdateModal = ({
  tableId,
  onUpdateSuccess,
}: TableUpdateModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    status: "AVAILABLE" as TableStatus,
    waiterId: "" as string | null,
  })
  const [originalData, setOriginalData] = useState<TableData | null>(null)
  const [waiters, setWaiters] = useState<Waiter[]>([])

  const loadTableData = async () => {
    setIsLoadingData(true)
    try {
      const res = await fetch(`/api/table/${tableId}`)
      if (!res.ok) throw new Error("Error al obtener mesa")

      const data: TableData = await res.json()
      setOriginalData(data)
      setFormData({
        code: data.code,
        status: data.status,
        waiterId: data.userDTO ? String(data.userDTO.id) : "-1",
      })
    } catch (err) {
      setMessage({
        type: "error",
        text: "Error al cargar los datos de la mesa",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadWaiters = async () => {
    try {
      const res = await fetch("/api/user/getAllWaiters")
      if (res.ok) {
        const data = await res.json()
        setWaiters(data)
      }
    } catch {
      // Ignorar errores de carga de meseros
    }
  }

  const openModal = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
      loadTableData()
      loadWaiters()
    }
  }

  const closeModal = () => {
    dialogRef.current?.close()
    setMessage(null)
    setFormData({ code: "", status: "AVAILABLE", waiterId: null })
    setOriginalData(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getChangedFields = () => {
    if (!originalData) return {}

    const updates: any = {}

    if (formData.code !== originalData.code) updates.code = formData.code
    if (formData.status !== originalData.status)
      updates.status = formData.status
    const currentWaiterId = originalData.userDTO
      ? String(originalData.userDTO.id)
      : "-1"
    if (formData.waiterId !== currentWaiterId) {
      updates.waiterId =
        formData.waiterId === "-1" ? -1 : Number(formData.waiterId)
    }

    return updates
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const changes = getChangedFields()

    if (Object.keys(changes).length === 0) {
      setMessage({ type: "error", text: "No se detectaron cambios." })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/table/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tableId, ...changes }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({
          type: "error",
          text: result.message || "Error al actualizar mesa",
        })
        return
      }

      setMessage({ type: "success", text: "Mesa actualizada correctamente" })
      setTimeout(() => {
        closeModal()
        onUpdateSuccess?.()
      }, 500)
    } catch (err) {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center w-full text-left bg-white px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
      >
        <span className="mr-3">✏️</span> Editar
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 max-w-md w-full backdrop:bg-black/50 m-auto"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal()
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Actualizar Mesa</h2>
            <button type="button" onClick={closeModal}>
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

          {!isLoadingData && originalData && (
            <>
              <div>
                <label htmlFor="code" className="block text-sm mb-1">
                  Código
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="OCCUPIED">Ocupada</option>
                </select>
              </div>

              <div>
                <label htmlFor="waiterId" className="block text-sm mb-1">
                  Mesero asignado
                </label>
                <select
                  id="waiterId"
                  name="waiterId"
                  value={formData.waiterId || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="-1">Sin asignar</option>
                  {waiters.map((w) => (
                    <option key={w.id} value={w.id}>
                      ({w.id}){w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isLoading ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </>
          )}
        </form>
      </dialog>
    </>
  )
}

export default TableUpdateModal
