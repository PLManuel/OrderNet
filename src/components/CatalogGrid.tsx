import type { Product } from "@/types/catalog"
import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"

const CatalogGrid = () => {
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product/getAll")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (productId: number) => {
    const confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    )
    if (!confirmDelete) return

    try {
      await fetch("/api/product/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      })

      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1">
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-[12px_12px_0_0] border-gray-200">
        <h2 className="text-xl font-bold text-white">Productos</h2>
        <p className="text-green-100 text-sm mt-1">
          Total: {products.length} productos
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onEdit={fetchProducts}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-500">
              Agrega productos para comenzar a gestionar tu menú.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogGrid
