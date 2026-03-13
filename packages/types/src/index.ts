export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Portfolio {
  id: string
  userId: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}
