const UnassignWaitersButton = () => {
  const handleClick = async () => {
    try {
      const response = await fetch("/api/table/getAll")
      const tables = await response.json()
      for (const table of tables) {
        const updatePayload = {
          id: table.id,
          waiterId: -1,
        }

        const res = await fetch("/api/table/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        })

        if (!res.ok) {
          console.error(`❌ Error al desasignar mesa ${table.id}`)
        } else {
          console.log(`✅ Mesa ${table.code} desasignada`)
        }
      }

      alert("Todas las mesas fueron desasignadas.")
      window.location.reload()
    } catch (err) {
      console.error("Error al desasignar mesas:", err)
      alert("Ocurrió un error al desasignar las mesas.")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 text-sm rounded-lg transition-colors"
    >
      Desasignar todas
    </button>
  )
}

export default UnassignWaitersButton
