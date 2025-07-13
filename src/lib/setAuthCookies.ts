import type { AstroCookies } from "astro"

export function setAuthCookies(
  cookies: AstroCookies,
  accessToken: string,
  refreshToken: string,
  user: any
) {
  cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 24,
    sameSite: "strict",
  })

  cookies.set("refreshToken", refreshToken, {
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      })
    ),
    {
      httpOnly: false,
      secure: import.meta.env.PROD,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
    }
  )
}
