// Exports:
export type FoodType = 'veg' | 'non-veg'

export interface Rating {
  votes: number
  value: number
}

export interface Food {
  name: string
  description: string
  price: number
  type: FoodType
  image: string | null
  thumbnail: string | null
  rating: Rating
}

export interface SubSection {
  title: string
  foods: Food[]
}

export interface Section {
  title: string
  subSections: SubSection[]
}

export interface Restaurant {
  name: string
  address: string
  image: string | null
  menu: Section[] | null
  rating: Rating & {
    color: string | null
  }
  url: string
}
