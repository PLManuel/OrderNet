import { useRef, useState } from "react"

interface UserDeleteButtonProps {
  userId: number
  userEmail: string
  onDeleteSuccess: () => void
}

export default function UserDeleteButton({
  userId,
  userEmail,
  onDeleteSuccess,
}: UserDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openConfirmation = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
  }

  const closeConfirmation = () => {
    if (dialogRef.current) {
      dialogRef.current.close()
    }
    setError(null)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
        }),
      })

      if (response.ok) {
        closeConfirmation()
        onDeleteSuccess()
      } else {
        const data = await response.json()
        setError(data.message || "Error al eliminar el usuario")
      }
    } catch (err) {
      setError("Error de conexión al intentar eliminar el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openConfirmation}
        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
      >
        <span className="mr-3">🗑️</span>
        Eliminar
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg mt-5 shadow-xl border border-gray-200 p-0 backdrop:bg-black/50 w-full max-w-md mx-auto"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeConfirmation()
        }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmar eliminación
            </h3>
            <button
              onClick={closeConfirmation}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Cerrar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5">
            <header className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">
                ¿Estás seguro de eliminar este usuario?
              </h3>

              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </header>
            <p>
              Vas a eliminar al usuario con correo:{" "}
              <span className="font-semibold">{userEmail}</span>
            </p>
            <p className="mt-1">Esta acción no se puede deshacer.</p>
            {error && <span className="block sm:inline">{error}</span>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeConfirmation}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Eliminando...
                </div>
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
