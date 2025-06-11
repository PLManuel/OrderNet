import type { APIRoute } from "astro"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { clearAuthCookies } from "@/lib/clearAuthCookies"

export const prerender = false

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const response = await fetchWithAuth({
      cookies,
      input: "http://localhost:8080/auth/logout",
      init: {
        method: "POST",
      },
    })

    console.log(response)

    if (!response.ok) {
      const data = await response.json()
      return new Response(JSON.stringify({ error: data.message }), {
        status: response.status,
      })
    }

    clearAuthCookies(cookies)

    return new Response(JSON.stringify({ redirectTo: "/login" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("Error interno:", err)
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    })
  }
}
