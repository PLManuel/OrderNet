import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = async ({ cookies, params }) => {
  const id = params.id

  if (!id) {
    return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
      status: 400,
    })
  }

  try {
    const response = await fetchWithAuth({
      cookies,
      input: `http://localhost:8080/order/${id}`,
      init: {
        method: "GET",
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: responseData.message || "Error al obtener orden",
        }),
        { status: response.status }
      )
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    })
  }
}
