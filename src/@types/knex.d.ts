// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      created_at: string
      updated_at: string
    }
    meals: {
      id: string
      userId: string
      name: string
      description: string
      date: string
      isDietMeals: boolean
    }
  }
}
