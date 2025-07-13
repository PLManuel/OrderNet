import { useEffect, useState } from "react"
import TableUpdateModal from "./TableUpdateModal"

type User = {
  id: number
  name: string
  email: string
  active: boolean
  role: string
}
type Table = {
  id: number
  code: string
  status: string
  userDTO: User | null
}

const TableList = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [, setIsLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<number[]>([])

  const fetchTables = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/table/getAll")
      const data = await res.json()
      setTables(data)
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta mesa?")) return

    setDeletingIds((prev) => [...prev, id])
    try {
      await fetch("/api/table/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      setTables((prev) => prev.filter((cat) => cat.id !== id))
    } catch (error) {
      console.error("Error deleting table:", error)
    } finally {
      setDeletingIds((prev) => prev.filter((val) => val !== id))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-5">
      <div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Codigo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mozo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table, index) => (
              <tr
                key={table.id}
                className={`hover:bg-blue-50 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {table.id}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{table.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      table.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        table.status === "AVAILABLE"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    ></span>
                    {table.status === "AVAILABLE" ? "Disponible" : "Ocupado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${
                      table.userDTO
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {table.userDTO
                      ? `(${table.userDTO?.id}) ${table.userDTO?.name}`
                      : "No asignado"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === table.id ? null : table.id)
                    }
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  >
                    <span>⚙️</span>
                    <span
                      className={`ml-1 transform transition-transform duration-200 ${
                        openMenuId === table.id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openMenuId === table.id && (
                    <div className="absolute left-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <TableUpdateModal
                        tableId={table.id}
                        onUpdateSuccess={() => {
                          setOpenMenuId(null)
                          fetchTables()
                        }}
                      />
                      <button
                        disabled={deletingIds.includes(table.id)}
                        onClick={() => handleDelete(table.id)}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      >
                        <span className="mr-3">🗑️</span>
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay mesas
          </h3>
          <p className="text-gray-500">
            No se encontraron mesas en el sistema.
          </p>
        </div>
      )}
    </div>
  )
}

export default TableList