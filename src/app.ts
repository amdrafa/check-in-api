import fastify from "fastify"
import { z } from "zod/lib"

export const app = fastify()

app.post("/users", async (request, reply) => {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
    })

    const { name, email, password } = registerBodySchema.parse(request.body)



    return reply.status(201).send()

})