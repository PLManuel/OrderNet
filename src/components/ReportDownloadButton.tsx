import { useRef, useState } from "react"

const ReportDownloadButton = () => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = () => dialogRef.current?.showModal()

  const closeModal = () => {
    dialogRef.current?.close()
    setStartDate("")
    setEndDate("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      setError("Ambas fechas son requeridas.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/order/report?startDate=${startDate}&endDate=${endDate}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Hubo un error al generar el reporte.")
        setLoading(false)
        return
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `ordenes_${startDate}_a_${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setLoading(false)
      closeModal()
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo más tarde.")
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
      >
        Descargar Reporte
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl p-6 m-auto backdrop:bg-black/40"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Selecciona el rango de fechas
          </h2>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-700"
            >
              Fecha de inicio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-700"
            >
              Fecha de fin
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="border rounded px-3 py-2"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

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
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-semibold ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Cargando..." : "Generar Reporte"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

export default ReportDownloadButton
