import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    console.log("Fechas recibidas:", startDate, endDate)

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "Faltan fechas" }), {
        status: 400,
      })
    }

    const fullUrl = `http://localhost:8080/order/report?startDate=${startDate}&endDate=${endDate}`

    console.log(fullUrl)

    const response = await fetchWithAuth({
      cookies,
      input: fullUrl,
      init: {
        method: "GET",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return new Response(
        JSON.stringify({
          error: errorData.message || "Error al obtener el reporte",
        }),
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=ordenes_${startDate}_a_${endDate}.xlsx`,
      },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    })
  }
}
