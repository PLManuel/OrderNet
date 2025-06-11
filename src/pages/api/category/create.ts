import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { APIRoute } from "astro"

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json()

    const payload = {
      name: data.name
    }

    const response = await fetchWithAuth({
      cookies,
      input: "http://localhost:8080/category/create",
      init: {
        method: "POST",
        body: JSON.stringify(payload),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return new Response(
        JSON.stringify({ error: error.message || "Error al crear la categoria" }),
        {
          status: response.status,
        }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
    })
  } catch (err) {
    console.error("Error:", err)
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    })
  }
}
