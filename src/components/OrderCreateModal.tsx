import { useEffect, useRef, useState } from "react"
import VoiceOrderButton from "./VoiceOrderButton"

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
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Crear Pedido
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-3xl rounded-xl p-6 m-auto backdrop:bg-black/40 bg-white shadow-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">🧾 Nuevo Pedido</h2>

          <div>
            <label className="text-sm font-medium block mb-1">
              Mesa asignada
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <VoiceOrderButton
            products={products}
            onSetItems={(items) => {
              setOrderItems((prev) => ({ ...prev, ...items }))
            }}
            onAddNotes={(extra) =>
              setNotes((prev) => prev + (prev ? "\n" : "") + extra)
            }
          />

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Producto</label>
              <select
                value={selectedProductId ?? ""}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Selecciona un producto</option>
                {products
                  .filter((p) => !(p.id in orderItems))
                  .map((p) => (
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
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={addProductToOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar
            </button>
          </div>

          {Object.keys(orderItems).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Productos seleccionados:</h4>
              <ul className="space-y-3">
                {Object.entries(orderItems).map(([id, qty]) => {
                  const product = products.find((p) => p.id === Number(id))
                  return (
                    <li
                      key={id}
                      className="flex justify-between items-center border p-3 rounded-md shadow-sm bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{product?.name}</div>
                        <div className="text-sm text-gray-600">
                          Precio unitario: S/ {product?.price?.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-sm">Cantidad:</label>
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value)
                              if (newQty > 0) {
                                setOrderItems((prev) => ({
                                  ...prev,
                                  [Number(id)]: newQty,
                                }))
                              }
                            }}
                            className="w-20 border border-gray-300 px-2 py-1 rounded-md"
                          />
                          <span className="ml-auto font-semibold text-sm">
                            Total: S/ {(product?.price || 0) * qty}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProductFromOrder(Number(id))}
                        className="text-red-600 hover:text-red-800 ml-4"
                        title="Quitar producto"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="text-right mt-4 font-bold text-lg">
                Total: S/ {calculateTotal().toFixed(2)}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">
              Notas del pedido
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none"
              rows={3}
              placeholder="Observaciones, alergias, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Confirmar Pedido
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export default OrderCreateModal
