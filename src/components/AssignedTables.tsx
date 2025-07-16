import { useEffect, useState } from "react"

interface AssignedTable {
  id: string
  code: string
  status: string
}

interface User {
  assignedTables?: AssignedTable[]
}

const AssignedTables = () => {
  const [user, setUser] = useState<User | null>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/getMyUser")
      const data = await res.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div className="bg-white w-96 rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-3 py-4 flex justify-between bg-gradient-to-r from-purple-600 to-purple-700">
        <div>
          <h2 className="text-xl font-bold text-white">Mesas asignadas</h2>
          <p className="text-blue-100 text-sm mt-1">
            Revisa tus mesas asignadas
          </p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {(user?.assignedTables?.length ?? 0) > 0 ? (
          user?.assignedTables?.map((table) => (
            <div
              key={table.id}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <p>
                <strong>Código:</strong> {table.code}
              </p>
              <p>
                <strong>Estado:</strong> {table.status === "AVAILABLE" ? "Disponible" : "Ocupada"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No tienes mesas asignadas.</p>
        )}
      </div>
    </div>
  )
}

export default AssignedTables
