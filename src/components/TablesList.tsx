import TableCreateModal from "@/components/TableCreateModal"
import type { Table } from "@/types/catalog"
import { useEffect, useState } from "react"

export default function TablesList() {
  const [tables, setTables] = useState<Table[]>([])
  const [deletingIds, setDeletingIds] = useState<number[]>([])

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/table/getAll")
      const data = await res.json()
      setTables(data)
    } catch (error) {
      console.error("Error fetching tables:", error)
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
    <aside className="w-80">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Mesas</h2>
              <p className="text-purple-100 text-sm mt-1">
                Total: {tables.length}
              </p>
            </div>
            <TableCreateModal />
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {tables.map((table) => (
              <div
                key={table.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {table.code}
                    </h3>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ID: {table.id}
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={deletingIds.includes(table.id)}
                    onClick={() => handleDelete(table.id)}
                    className="ml-3 text-red-400 hover:text-red-600 focus:outline-none transition-colors duration-150 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tables.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📂</div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No hay mesas
            </h3>
            <p className="text-xs text-gray-500">
              Agrega mesas para crear tus pedidos.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
