import { setAuthCookies } from "@/lib/setAuthCookies"
import type { APIRoute } from "astro"

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json()

  if (!data.email || !data.password) {
    return new Response(JSON.stringify({ error: "Campos incompletos" }), {
      status: 400,
    })
  }

  const payload = {
    email: data.email.trim(),
    password: data.password,
  }

  try {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    return new Response(JSON.stringify({ redirectTo : "/" }), {
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
