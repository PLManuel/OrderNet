import { useEffect, useRef, useState } from "react"

interface AssignedTable {
  id: string
  code: string
  status: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  assignedTables: AssignedTable[]
}

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  available: boolean
  categoryDTO: Category
}

const OrderCreateModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<AssignedTable[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const fetchUserAndProducts = async () => {
    try {
      const userRes = await fetch("/api/user/getMyUser")
      const userData = await userRes.json()
      setUser(userData)

      let tableData: AssignedTable[] = []
      if (userData.role === "ADMINISTRATOR") {
        const tableRes = await fetch("/api/table/getAll")
        tableData = await tableRes.json()
      } else {
        tableData = userData.assignedTables || []
      }
      setTables(tableData)

      if (tableData.length > 0) {
        setSelectedTable(tableData[0].id)
      }

      const productRes = await fetch("/api/product/getAll")
      const productData = await productRes.json()
      setProducts(productData)
    } catch (err) {
      console.error("Error al cargar datos:", err)
    }
  }

  useEffect(() => {
    fetchUserAndProducts()
  }, [])

  const openModal = () => {
    dialogRef.current?.showModal()
  }

  const closeModal = () => {
    dialogRef.current?.close()
  }

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTable) return

    const details = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }))

    if (details.length === 0) {
      alert("Debes seleccionar al menos un producto.")
      return
    }

    const payload = {
      tableId: selectedTable,
      waiterId: user.id.toString(),
      notes,
      details,
    }

    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        closeModal()
        setNotes("")
        setQuantities({})
        alert("Pedido creado correctamente")
        window.location.reload()
      } else {
        const error = await res.json()
        alert(error.message || "Error al crear pedido")
      }
    } catch (err) {
      console.error("Error al crear pedido:", err)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
      >
        Crear Pedido
      </button>

      <dialog ref={dialogRef} className="w-full max-w-2xl rounded-xl p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold">Nuevo Pedido</h2>

          <label className="block">
            <span className="text-sm font-medium">Mesa</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.code} ({table.status})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Notas</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              rows={3}
              placeholder="Notas del pedido"
            ></textarea>
          </label>

          <div>
            <h3 className="text-sm font-semibold mb-2">Productos</h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {product.name} (S/ {product.price})
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="w-20 border rounded px-2 py-1"
                    value={quantities[product.id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(
                        product.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Crear
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default OrderCreateModal
