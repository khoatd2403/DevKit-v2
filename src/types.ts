export interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  new?: boolean
  popular?: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}
