export type Category = {
  id: number
  name: string
}

export type Table = {
  id: number
  code: string
}

export type Product = {
  id: number
  name: string
  description: string
  price: number
  available: boolean
  categoryDTO: Category
}

type Role = "WAITER" | "ADMINISTRATOR"

export type User = {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
}

export type ProductCreateData = {
  name: string
  description: string
  price: string | number
  categoryId: string | number
}

export type CategoryCreateData = {
  name: string
}

export type TableCreateData = {
  code: string
}
