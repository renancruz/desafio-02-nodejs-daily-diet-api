import { FastifyReply, FastifyRequest } from 'fastify'
import { verify } from 'jsonwebtoken'
import { env } from '../env'
import { knex } from '../database'

interface IPayload {
  sub: string
}

export async function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const auth = request.headers.authorization

  if (!auth) {
    return reply.status(401).send({
      error: 'Token missing.',
    })
  }

  const [, token] = auth.split(' ')
  try {
    const { sub } = verify(token, env.SECRET_KEY) as IPayload

    const userAuthenticated = await knex('users').where({ id: sub }).first()

    if (!userAuthenticated) {
      reply.status(401).send({ error: 'User does not exists' })
    }

    const user = {
      id: userAuthenticated?.id,
      name: userAuthenticated?.name,
      email: userAuthenticated?.email,
      created_at: userAuthenticated?.created_at,
      updated_at: userAuthenticated?.updated_at,
    }

    request.body = { ...(request.body as object), user }
  } catch {
    reply.status(401).send({ error: 'Invalid token' })
  }
}
