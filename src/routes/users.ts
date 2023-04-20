import { FastifyInstance } from 'fastify'

import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { compare, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { env } from '../env'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserSchema.parse(request.body)

    const passwordHash = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: passwordHash,
    })
    reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginSchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      reply.status(400).send({ error: 'email or password is incorrect' })
    }

    if (user?.password) {
      const passwordMath = await compare(password, user?.password)

      if (!passwordMath) {
        reply.status(400).send({ error: 'email or password is incorrect' })
      }
    } else {
      reply.status(400).send({ error: 'email or password is incorrect' })
    }

    if (user?.id) {
      const token = sign({}, env.SECRET_KEY, {
        subject: user.id,
        expiresIn: '2d',
      })

      reply.send({
        auth: true,
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      })
    }
  })
}
