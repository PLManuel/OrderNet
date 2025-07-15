import { useEffect, useState } from "react"
import OrderUpdateModal from "./OrderUpdateModal"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  READY_TO_SERVE: "Listo para servir",
  TO_PAY: "Por pagar",
  COMPLETED: "Completado",
}

const ORDERED_STATUSES: Array<
  "PENDING" | "READY_TO_SERVE" | "TO_PAY" | "COMPLETED"
> = ["PENDING", "READY_TO_SERVE", "TO_PAY", "COMPLETED"]

const SECONDS_INTERVAL = 10

type OrderDetail = {
  id: number
  quantity: number
  product: {
    name: string
    price: number
  }
}

type Order = {
  id: number
  tableId: number
  status: "PENDING" | "READY_TO_SERVE" | "TO_PAY" | "COMPLETED"
  createdAt: string
  notes?: string
  total: number
  details: OrderDetail[]
  waiterName?: string
}

const OrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const userRes = await fetch("/api/user/getMyUser")
      const userData = await userRes.json()
      setUserRole(userData.role)

      const allOrdersRes = await fetch("/api/order/getAll")
      const allOrders: Order[] = await allOrdersRes.json()

      if (userData.role === "ADMINISTRATOR") {
        setOrders(allOrders)
      } else {
        const assignedTables = userData.assignedTables ?? []
        const assignedTableIds = assignedTables.map((t: any) => t.id)
        const myOrders = allOrders.filter((order) =>
          assignedTableIds.includes(order.tableId)
        )
        setOrders(myOrders)
      }
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, SECONDS_INTERVAL * 1000)
    return () => clearInterval(interval)
  }, [])

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.status
    if (!acc[status]) acc[status] = []
    acc[status].push(order)
    return acc
  }, {} as Record<string, Order[]>)

  const getNextStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "Listo para servir"
      case "READY_TO_SERVE":
        return "Por pagar"
      case "TO_PAY":
        return "Completado"
      default:
        return null
    }
  }

  const getNextStatus = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "READY_TO_SERVE"
      case "READY_TO_SERVE":
        return "TO_PAY"
      case "TO_PAY":
        return "COMPLETED"
      default:
        return null
    }
  }

  const handleStatusChange = async (
    orderId: number,
    currentStatus: Order["status"]
  ) => {
    const newStatus = getNextStatus(currentStatus)
    if (!newStatus) return

    try {
      const res = await fetch(`/api/order/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (res.ok) {
        fetchOrders()
      } else {
        console.error("Error al actualizar estado")
      }
    } catch (err) {
      console.error("Error al hacer PUT:", err)
    }
  }

  const handleDelete = async (orderId: number) => {
    const confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar esta orden?"
    )
    if (!confirmDelete) return

    try {
      await fetch("/api/order/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      })

      fetchOrders()
    } catch (error) {
      console.error("Error deleting order:", error)
    }
  }

  return (
    <div className="space-y-6">
      {ORDERED_STATUSES.map((status) =>
        groupedOrders[status]?.length ? (
          <div key={status}>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {STATUS_LABELS[status]}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {groupedOrders[status].map((order) => {
                const cardColor =
                  order.status === "PENDING"
                    ? "border-yellow-400 bg-yellow-50"
                    : order.status === "READY_TO_SERVE"
                    ? "border-blue-400 bg-blue-50"
                    : order.status === "TO_PAY"
                    ? "border-orange-400 bg-orange-50"
                    : "border-green-400 bg-green-50"

                return (
                  <div
                    key={order.id}
                    className={`border rounded-lg shadow-sm p-4 ${cardColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-semibold text-purple-700">
                          Pedido #{order.id} — Mesa #{order.tableId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          🕒 {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {userRole === "ADMINISTRATOR" && (
                          <p className="text-sm text-gray-700 mt-1">
                            👤 Mozo:{" "}
                            <span className="font-medium">
                              {order.waiterName}
                            </span>
                          </p>
                        )}
                        <p className="text-sm text-gray-600 italic mt-1">
                          {order.notes || "Sin notas"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">
                          Total: S/ {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {order.details.map((detail) => (
                        <div
                          key={detail.id}
                          className="flex justify-between text-sm text-gray-700"
                        >
                          <span>
                            {detail.quantity}× {detail.product.name}
                          </span>
                          <span>
                            S/{" "}
                            {(detail.quantity * detail.product.price).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                      {getNextStatusLabel(order.status) && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, order.status)
                          }
                          className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                        >
                          {getNextStatusLabel(order.status)}
                        </button>
                      )}
                      <OrderUpdateModal
                        onUpdateSuccess={() => {
                          fetchOrders()
                        }}
                        orderId={order.id}
                      />
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}

export default OrdersTable
