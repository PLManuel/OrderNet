import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { APIRoute } from "astro"

export const prerender = false

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json()
    console.log("Received data:", data)
    const { id, ...updateData } = data

    const response = await fetchWithAuth({
      cookies,
      input: `http://localhost:8080/order/update/${id}`,
      init: {
        method: "PUT",
        body: JSON.stringify(updateData),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return new Response(
        JSON.stringify({ error: error.message || "Error en actualizar" }),
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
