import type { AstroCookies } from "astro"

type FetchWithAuthParams = {
  cookies: AstroCookies
  input: RequestInfo
  init?: RequestInit
}

export async function fetchWithAuth({
  cookies,
  input,
  init,
}: FetchWithAuthParams): Promise<Response> {
  let accessToken = cookies.get("accessToken")?.value
  const refreshToken = cookies.get("refreshToken")?.value

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    Authorization: `Bearer ${accessToken}`,
  }

  if (!headers["Content-Type"] && init?.method !== "GET") {
    headers["Content-Type"] = "application/json"
  }

  let response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status !== 403 && response.status !== 400) {
    return response
  }

  if (!refreshToken) return response

  const refreshRes = await fetch("http://localhost:8080/auth/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!refreshRes.ok) return response

  const data = await refreshRes.json()

  cookies.set("accessToken", data.accessToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 24,
    sameSite: "strict",
  })

  cookies.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
  })

  cookies.set(
    "userInfo",
    encodeURIComponent(
      JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        active: data.user.active,
      })
    ),
    {
      httpOnly: false,
      secure: import.meta.env.PROD,
      path: "/",
      maxAge: 60 * 24,
      sameSite: "strict",
    }
  )

  console.log("---- refresh token ----")

  const retryHeaders: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    Authorization: `Bearer ${data.accessToken}`,
  }

  if (!retryHeaders["Content-Type"] && init?.method !== "GET") {
    retryHeaders["Content-Type"] = "application/json"
  }

  const retryResponse = await fetch(input, {
    ...init,
    headers: retryHeaders,
  })

  return retryResponse
}
