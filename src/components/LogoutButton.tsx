const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Error al cerrar sesión")
      }
      const data = await response.json()
      window.location.href = data.redirectTo
    } catch (error: any) {
      console.error("Error:", error.message)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-error py-2 px-3 items-center rounded-xl flex w-fit mx-auto"
    >
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
          clipRule="evenodd"
        ></path>
      </svg>
      Cerrar sesión
    </button>
  )
}

export default LogoutButton
