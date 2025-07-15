const OrganizeTablesButton = () => {
  const handleClick = async () => {
    const waitersRes = await fetch("/api/user/getAllActiveWaiters")
    const waiters = await waitersRes.json()
    const tablesRes = await fetch("/api/table/getAll")
    const tables = await tablesRes.json()
    if (waiters.length === 0) {
      alert("No hay mozos activos para asignar.")
      return
    }
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i]
      const waiter = waiters[i % waiters.length]
      const updatePayload = {
        id: table.id,
        waiterId: waiter.id,
      }

      try {
        const response = await fetch("/api/table/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        })

        if (!response.ok) {
          console.error(`❌ Error al actualizar mesa ${table.id}`)
        } else {
          console.log(`✅ Mesa ${table.code} asignada a mozo ${waiter.name}`)
        }
      } catch (err) {
        console.error(`Error en mesa ${table.id}:`, err)
      }
    }

    alert("Mesas asignadas equitativamente.")
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 block h-fit w-fit rounded-lg py-2 px-3 text-sm text-white hover:bg-blue-600 transition-colors"
    >
      Organizar Mozos
    </button>
  )
}

export default OrganizeTablesButton
