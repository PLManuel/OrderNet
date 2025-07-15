import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { User } from "@/types/catalog"
import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = async ({ cookies }) => {
  const userInfoCookie = cookies.get("userInfo")?.value

  let userInfo: User | null = null

  if (userInfoCookie) {
    try {
      userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
    } catch (err) {
      console.error("Error al parsear userInfo:", err)
    }
  }

  if (!userInfo?.id) {
    return new Response(JSON.stringify({ error: "No autorizado, falta ID" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const response = await fetchWithAuth({
      cookies,
      input: `http://localhost:8080/user/${userInfo.id}`,
      init: {
        method: "GET",
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: responseData.message || "Error al obtener usuario",
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
