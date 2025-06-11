import { setAuthCookies } from "@/lib/setAuthCookies"
import type { APIRoute } from "astro"

export const prerender = false

export const POST: APIRoute = async ({ cookies }) => {
  const refreshToken = cookies.get("refreshToken")?.value

  const payload = {
    refreshToken: refreshToken,
  }
  try {
    const response = await fetch("http://localhost:8080/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: responseData.message,
        }),
        { status: response.status }
      )
    }

    const { accessToken, refreshToken, user } = responseData

    setAuthCookies(cookies, accessToken, refreshToken, user)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ e: "Error interno" }), {
      status: 500,
    })
  }
}
