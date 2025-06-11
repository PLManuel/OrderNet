"use client"

import { useState } from "react"
import type { Product } from "@/types/catalog"
import ProductUpdateModal from "./ProductUpdateModal"

interface ProductCardProps {
  product: Product
  onEdit?: (productId: number) => void
  onDelete?: (productId: number) => void
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={`imgs/placeholder.svg?height=200&width=200`}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.available ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {product.categoryDTO.name}
          </span>

          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
            >
              <span className="mr-1">⚙️</span>
              <span
                className={`transform transition-transform duration-200 ${
                  openMenu ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-fit">
                <ProductUpdateModal
                  productId={product.id}
                  onUpdateSuccess={() => {
                    onEdit?.(product.id)
                    setOpenMenu(false)
                  }}
                />
                <button
                  onClick={() => {
                    onDelete?.(product.id)
                    setOpenMenu(false)
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                  <span className="mr-2">🗑️</span>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
