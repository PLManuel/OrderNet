import type { AstroCookies } from "astro"

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.set("accessToken", "", {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    maxAge: 0,
  })

  cookies.set("refreshToken", "", {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    maxAge: 0,
  })

  cookies.set("userInfo", "", {
    path: "/",
    httpOnly: false,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    maxAge: 0,
  })
}
