import { useRef, useState } from "react"

interface Product {
  available: boolean
  id: number
  name: string
  price: number
}

interface AssignedTable {
  id: number
  code: string
}

interface Detail {
  productId: number
  quantity: number
}

interface OrderDetail {
  id: number
  quantity: number
  product: Product
}

interface Order {
  id: number
  tableId: number
  notes: string
  status: string
  details: OrderDetail[]
}

type Props = {
  orderId: number
  onUpdateSuccess?: () => void
}

const OrderUpdateModal = ({ orderId, onUpdateSuccess }: Props) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [tableId, setTableId] = useState<number>()
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [details, setDetails] = useState<Detail[]>([])
  const [tables, setTables] = useState<AssignedTable[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedProductId, setSelectedProductId] = useState<number>()
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1)

  const fetchData = async () => {
    const orderRes = await fetch(`/api/order/${orderId}`)
    const orderData = await orderRes.json()
    setOrder(orderData)
    setTableId(orderData.tableId)
    setNotes(orderData.notes)
    setStatus(orderData.status)
    setDetails(
      orderData.details.map((d: OrderDetail) => ({
        productId: d.product.id,
        quantity: d.quantity,
      }))
    )

    const userRes = await fetch("/api/user/getMyUser")
    const user = await userRes.json()
    const tablesRes = await fetch(
      user.role === "ADMINISTRATOR"
        ? "/api/table/getAll"
        : "/api/user/getMyUser"
    )
    const tableData = await tablesRes.json()
    setTables(
      user.role === "ADMINISTRATOR" ? tableData : tableData.assignedTables
    )

    const prodRes = await fetch("/api/product/getAll")
    const prodData = await prodRes.json()

    const productsInOrder = orderData.details.map((d: OrderDetail) => d.product)
    const combinedProductsMap = new Map<number, Product>()
    productsInOrder.forEach((p: Product) => combinedProductsMap.set(p.id, p))
    prodData
      .filter((p: Product & { available: boolean }) => p.available)
      .forEach((p: Product) => combinedProductsMap.set(p.id, p))
    setProducts(Array.from(combinedProductsMap.values()))
  }

  const openModal = () => {
    fetchData()
    dialogRef.current?.showModal()
  }

  const closeModal = () => {
    dialogRef.current?.close()
  }

  const handleSubmit = async () => {
    const updatePayload: any = {
      id: orderId,
      tableId,
      notes,
      status,
    }

    if (details.length > 0) {
      updatePayload.details = details
    }

    await fetch("/api/order/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    })

    if (onUpdateSuccess) {
      onUpdateSuccess()
    }
    closeModal()
  }

  const addProduct = (productId: number, quantity: number) => {
    if (!quantity || quantity <= 0) return
    setDetails((prev) => {
      const exists = prev.find((d) => d.productId === productId)
      if (exists) {
        return prev.map((d) =>
          d.productId === productId
            ? { ...d, quantity: d.quantity + quantity }
            : d
        )
      } else {
        return [...prev, { productId, quantity }]
      }
    })
    setSelectedProductId(undefined)
    setNewProductQuantity(1)
  }

  const removeProduct = (productId: number) => {
    setDetails((prev) => prev.filter((d) => d.productId !== productId))
  }

  const handleQuantityChange = (productId: number, quantity: number) => {
    setDetails((prev) => {
      const exists = prev.find((d) => d.productId === productId)
      if (exists) {
        return prev.map((d) =>
          d.productId === productId ? { ...d, quantity } : d
        )
      } else {
        return [...prev, { productId, quantity }]
      }
    })
  }

  return (
    <>
      <button
        onClick={openModal}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Editar Pedido
      </button>

      <dialog
        ref={dialogRef}
        className="bg-white p-6 rounded-lg shadow-lg w-fit m-auto"
      >
        <h2 className="text-lg font-bold mb-4">Editar Orden #{orderId}</h2>

        <label className="block mb-2">
          Mesa:
          <select
            value={tableId}
            onChange={(e) => setTableId(Number(e.target.value))}
            className="w-full border rounded px-2 py-1 mt-1"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Notas:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </label>

        <label className="block mb-2">
          Estado:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
          >
            <option value="PENDING">Pendiente</option>
            <option value="READY_TO_SERVE">Listo para servir</option>
            <option value="TO_PAY">Por pagar</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </label>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Productos en la orden:</h3>

          {details.map((d) => {
            const product = products.find((p) => p.id === d.productId)
            if (!product) return null

            return (
              <div
                key={d.productId}
                className="flex items-center justify-between gap-2 mb-2"
              >
                <span className="flex-1">{product.name}</span>

                <input
                  type="number"
                  min={1}
                  value={d.quantity}
                  onChange={(e) =>
                    handleQuantityChange(d.productId, Number(e.target.value))
                  }
                  className="w-20 border rounded px-2 py-1"
                />

                <button
                  type="button"
                  onClick={() => removeProduct(d.productId)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Quitar
                </button>
              </div>
            )
          })}

          <hr className="my-4" />

          <h3 className="font-semibold mb-2">Agregar producto:</h3>
          <div className="flex items-center gap-2 mb-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="flex-1 border rounded px-2 py-1"
            >
              <option value="">Seleccione un producto</option>
              {products
                .filter(
                  (p) =>
                    p.available && !details.find((d) => d.productId === p.id)
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            <input
              type="number"
              min={1}
              value={newProductQuantity}
              onChange={(e) => setNewProductQuantity(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />

            <button
              type="button"
              onClick={() =>
                selectedProductId &&
                addProduct(selectedProductId, newProductQuantity)
              }
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Guardar cambios
          </button>
        </div>
      </dialog>
    </>
  )
}

export default OrderUpdateModal
