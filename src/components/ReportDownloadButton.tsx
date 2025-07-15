import { useRef, useState } from "react"

const ReportDownloadButton = () => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = () => {
    dialogRef.current?.showModal()
  }

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
      <button onClick={openModal} className="btn">
        Descargar Reporte
      </button>
      <dialog ref={dialogRef} className="m-auto p-4 bg-white rounded shadow-lg">
        <form onSubmit={handleSubmit} method="dialog">
          <h2>Selecciona el rango de fechas</h2>
          <div>
            <label htmlFor="startDate">Fecha de inicio</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="endDate">Fecha de fin</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            <button type="submit" disabled={loading}>
              {loading ? "Cargando..." : "Generar Reporte"}
            </button>
            <button type="button" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

export default ReportDownloadButton
