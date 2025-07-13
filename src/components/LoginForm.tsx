import { useState } from "react"

const LoginForm = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")?.toString().trim() || ""
    const password = formData.get("password")?.toString() || ""

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setErrorMsg(data.message || "Credenciales inválidas")
        setLoading(false)
        return
      }
      window.location.href = data.redirectTo
    } catch (error: any) {
      console.error("Error:", error)
      setErrorMsg("Error de conexión con el servidor")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="grid grid-rows-[1fr_auto] mb-3">
        <label htmlFor="email">Correo</label>
        <input
          className="bg-white autofill:!bg-white placeholder-gray-400 rounded-xl p-2 text-surface"
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          placeholder="Tu correo electrónico"
          required
        />
      </fieldset>
      <fieldset className="grid grid-rows-[1fr_auto] mb-3">
        <label htmlFor="password">Contraseña</label>
        <input
          className="bg-white placeholder-gray-400 rounded-xl p-2 text-surface"
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          required
        />
      </fieldset>
      <fieldset className="grid mb-5">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="remember-me" className="peer sr-only" />
          <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-hover"></div>
          <span className="ml-3">Recuérdame</span>
        </label>
      </fieldset>
      {errorMsg && <div className="text-red-500 text-sm mb-4">{errorMsg}</div>}
      <fieldset className="grid grid-rows-[1fr_auto]">
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover transition-colors duration-300 cursor-pointer p-2 uppercase rounded-xl disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </fieldset>
    </form>
  )
}

export default LoginForm
