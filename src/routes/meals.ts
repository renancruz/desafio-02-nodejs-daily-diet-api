import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { ensureAuthenticated } from '../middleware/ensureAuthenticated'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schema = z.object({
        user: z.any(),
      })
      const { user } = schema.parse(request.body)

      const meals = await knex('meals').where({ userId: user.id }).select()

      reply.send({ meals })
    },
  )
  app.get(
    '/:id',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schemaBody = z.object({
        user: z.any(),
      })
      const schemaParams = z.object({
        id: z.string(),
      })
      const { user } = schemaBody.parse(request.body)
      const { id } = schemaParams.parse(request.params)

      const meals = await knex('meals').where({ id, userId: user.id }).select()

      reply.send({ meals })
    },
  )

  app.get(
    '/summary',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schema = z.object({
        user: z.any(),
      })
      const { user } = schema.parse(request.body)

      const meals = await knex('meals')
        .where({ userId: user.id })
        .count({ count: ['id'] })
        .first()

      reply.send({ meals })
    },
  )

  app.get(
    '/summary/diet',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schema = z.object({
        user: z.any(),
      })
      const { user } = schema.parse(request.body)

      const dietMeals = await knex('meals')
        .where({ isDietMeals: true, userId: user.id })
        .count({ count: ['id'] })
        .first()

      reply.send({ dietMeals })
    },
  )

  app.get(
    '/summary/not-diet',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schema = z.object({
        user: z.any(),
      })
      const { user } = schema.parse(request.body)

      const notDietMeals = await knex('meals')
        .where({ isDietMeals: false, userId: user.id })
        .count({ count: ['id'] })
        .first()

      reply.send({ notDietMeals })
    },
  )

  app.get(
    '/best-sequenci-diet',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schema = z.object({
        user: z.any(),
      })
      const { user } = schema.parse(request.body)

      const bestSequenciDietMeals = await knex('meals')
        .where({ userId: user.id, isDietMeals: true })
        .count({ count: ['id'] })
        .groupBy('date')
        .orderBy('count', 'desc')
        .first()

      reply.send({ bestSequenciDietMeals })
    },
  )

  app.post(
    '/',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const createMealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDietMeals: z.boolean(),
        user: z.any(),
      })

      const { name, description, date, isDietMeals, user } =
        createMealsSchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date,
        isDietMeals,
        userId: user.id,
      })

      reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schemaBody = z.object({
        user: z.any(),
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDietMeals: z.boolean(),
      })
      const schemaParams = z.object({
        id: z.string(),
      })
      const { user, name, description, date, isDietMeals } = schemaBody.parse(
        request.body,
      )
      const { id } = schemaParams.parse(request.params)

      await knex('meals')
        .where({ userId: user.id, id })
        .update({ name, description, date, isDietMeals })

      reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [ensureAuthenticated] },
    async (request, reply) => {
      const schemaBody = z.object({
        user: z.any(),
      })
      const schemaParams = z.object({
        id: z.string(),
      })
      const { user } = schemaBody.parse(request.body)
      const { id } = schemaParams.parse(request.params)

      await knex('meals').where({ userId: user.id, id }).delete()

      reply.status(204).send()
    },
  )
}
