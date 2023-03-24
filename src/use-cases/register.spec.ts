import { compare } from "bcryptjs"
import { expect, it, describe, beforeEach } from "vitest"
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository"
import { PrismaUsersRepository } from "../repositories/prisma/prisma-users-repository"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"
import { RegisterUseCase } from "./register"

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe("Register use case", () => {

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new RegisterUseCase(usersRepository)
    })

    it("should be able to register", async () => {


        const { user } = await sut.execute({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password: "123456"
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it("should hash user password upon registration", async () => {

        const { user } = await sut.execute({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password: "123456"
        })

        const isPasswordCorrectlyHashed = await compare(
            "123456",
            user.password_hash
        )

        expect(isPasswordCorrectlyHashed).toBe(true)
    })


    it("should not be able to register with same email twice", async () => {

        await sut.execute({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password: "123456"
        })

        expect(async () => {
            await sut.execute({
                name: "John Doe",
                email: "johndoe@exemple.com",
                password: "123456"
            })
        }).rejects.toBeInstanceOf(UserAlreadyExistsError)
    })
})