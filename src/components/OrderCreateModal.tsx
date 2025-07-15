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

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  )
  const [selectedQty, setSelectedQty] = useState<number>(1)
  const [orderItems, setOrderItems] = useState<Record<number, number>>({})

  useEffect(() => {
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

    fetchUserAndProducts()
  }, [])

  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  const addProductToOrder = () => {
    if (!selectedProductId || selectedQty <= 0) return
    setOrderItems((prev) => ({
      ...prev,
      [selectedProductId]: (prev[selectedProductId] || 0) + selectedQty,
    }))
    setSelectedProductId(null)
    setSelectedQty(1)
  }

  const removeProductFromOrder = (productId: number) => {
    setOrderItems((prev) => {
      const updated = { ...prev }
      delete updated[productId]
      return updated
    })
  }

  const calculateTotal = () => {
    return Object.entries(orderItems).reduce((total, [id, qty]) => {
      const product = products.find((p) => p.id === Number(id))
      return total + (product?.price || 0) * qty
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTable) return

    const details = Object.entries(orderItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }))

    if (details.length === 0) {
      alert("Debes agregar al menos un producto.")
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
        setOrderItems({})
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

      <dialog
        ref={dialogRef}
        className="w-full max-w-3xl rounded-xl p-6 backdrop:bg-black/40"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Pedido</h2>

          {/* Mesa */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Mesa asignada
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Notas del pedido
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              rows={3}
              placeholder="Observaciones, alergias, etc."
            />
          </div>

          {/* Agregar Producto */}
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Producto</label>
              <select
                value={selectedProductId ?? ""}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Selecciona un producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (S/ {p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Cantidad</label>
              <input
                type="number"
                min={1}
                value={selectedQty}
                onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <button
              type="button"
              onClick={addProductToOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Agregar
            </button>
          </div>

          {/* Lista de Productos Agregados */}
          {Object.keys(orderItems).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Productos seleccionados:</h4>
              <ul className="space-y-2">
                {Object.entries(orderItems).map(([id, qty]) => {
                  const product = products.find((p) => p.id === Number(id))
                  return (
                    <li
                      key={id}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <div>
                        {product?.name} - {qty} x S/{" "}
                        {product?.price?.toFixed(2)} ={" "}
                        <strong>S/ {(product?.price || 0) * qty}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProductFromOrder(Number(id))}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Quitar
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* Total */}
              <div className="text-right mt-4 font-bold text-lg">
                Total: S/ {calculateTotal().toFixed(2)}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Confirmar Pedido
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default OrderCreateModal
