import { compare } from "bcryptjs"
import { expect, it, describe, beforeEach } from "vitest"
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository"
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository"
import { PrismaUsersRepository } from "../repositories/prisma/prisma-users-repository"
import { CreateGymUseCase } from "./create-gym"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"
import { RegisterUseCase } from "./register"

let gymsRepository: InMemoryGymsRepository
let sut: CreateGymUseCase

describe("Create gym use case", () => {

    beforeEach(() => {
        gymsRepository = new InMemoryGymsRepository()
        sut = new CreateGymUseCase(gymsRepository)
    })

    it("should be able to create a gym", async () => {


        const { gym } = await sut.execute({
            title: "JavaScript Gym",
            description: null,
            phone: null,
            latitude: -26.9079864,
            longitude: -48.6689706
        })

        expect(gym.id).toEqual(expect.any(String))
    })
})