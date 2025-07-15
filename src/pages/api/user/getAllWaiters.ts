import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const response = await fetchWithAuth({
      cookies,
      input: "http://localhost:8080/user",
      init: {
        method: "GET",
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: responseData.message || "Error al obtener usuarios",
        }),
        { status: response.status }
      )
    }

    const waiters = responseData.filter((user: any) => user.role === "WAITER")

    return new Response(JSON.stringify(waiters), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    })
  }
}
