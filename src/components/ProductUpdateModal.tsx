"use client"

import type { Product, ProductCreateData, Category } from "@/types/catalog"
import { useRef, useState, useEffect, type FormEvent } from "react"

const initialForm: ProductCreateData = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
}

interface ProductUpdateModalProps {
  productId: number
  onUpdateSuccess: () => void
}

const ProductUpdateModal = ({ productId, onUpdateSuccess }: ProductUpdateModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [formData, setFormData] = useState<ProductCreateData>(initialForm)
  const [originalData, setOriginalData] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/category/getAll")
      const data = await res.json()
      setCategories(data)
    } catch {
      setMessage({ type: "error", text: "Error al cargar categorías" })
    }
  }

  const loadProductData = async () => {
    setIsLoadingData(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/product/${productId}`)

      if (response.ok) {
        const productData: Product = await response.json()
        setOriginalData(productData)
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: productData.categoryDTO.id,
        })
      } else {
        const errorData = await response.json()
        setMessage({
          type: "error",
          text: errorData.message || "Error al cargar los datos del producto",
        })
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsLoadingData(false)
    }
  }

  const openModal = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
      loadProductData()
      loadCategories()
    }
  }

  const closeModal = () => {
    if (dialogRef.current) dialogRef.current.close()
    setMessage(null)
    setFormData(initialForm)
    setOriginalData(null)
  }

  const getChangedFields = () => {
    if (!originalData) return {}
    const changes: any = { id: productId }

    if (formData.name !== originalData.name) changes.name = formData.name
    if (formData.description !== originalData.description) changes.description = formData.description
    if (Number(formData.price) !== originalData.price) changes.price = formData.price
    if (Number(formData.categoryId) !== originalData.categoryDTO.id) changes.categoryId = formData.categoryId

    return changes
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const changedFields = getChangedFields()

    if (Object.keys(changedFields).length === 1) {
      setMessage({ type: "error", text: "No se detectaron cambios" })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/product/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Producto actualizado correctamente" })
        setTimeout(() => {
          closeModal()
          onUpdateSuccess()
        }, 700)
      } else {
        setMessage({ type: "error", text: data.message || "Error al actualizar" })
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
      >
        <span className="mr-2">✏️</span>Editar
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 max-w-md w-full backdrop:bg-black/50 m-auto"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal()
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Editar producto</h2>

          {message && (
            <p
              className={`text-sm ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          {isLoadingData ? (
            <p className="text-gray-500">Cargando datos...</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full border px-3 py-2 rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <textarea
                placeholder="Descripción"
                className="w-full border px-3 py-2 rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <input
                type="number"
                placeholder="Precio"
                className="w-full border px-3 py-2 rounded-md"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
              />

              <select
                className="w-full border px-3 py-2 rounded-md"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </>
          )}
        </form>
      </dialog>
    </>
  )
}

export default ProductUpdateModal
