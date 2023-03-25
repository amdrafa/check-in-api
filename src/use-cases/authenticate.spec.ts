import { hash } from "bcryptjs"
import { expect, it, describe, beforeEach } from "vitest"
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository"
import { UsersRepository } from "../repositories/users-repository"
import { AuthenticateUseCase } from "./authenticate"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error"

let usersRepository: UsersRepository
let sut: AuthenticateUseCase

describe("Register use case", () => {

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new AuthenticateUseCase(usersRepository)
    })

    it("should be able to authenticate", async () => {


        await usersRepository.create({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password_hash: await hash("123456", 6)
        })

        const { user } = await sut.execute({
            email: "johndoe@exemple.com",
            password: "123456"
        })

        expect(user.id).toEqual(expect.any(String))
    })


    it("should be able to authenticate with wrong email", async () => {

        await expect(() => sut.execute({
            email: "johndoe@exemple.com",
            password: "123456"
        })).rejects.toBeInstanceOf(InvalidCredentialsError)

    })

    it("should be able to authenticate with wrong password", async () => {

        await usersRepository.create({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password_hash: await hash("123456", 6)
        })

        await expect(() => sut.execute({
            email: "johndoe@exemple.com",
            password: "123123"
        })).rejects.toBeInstanceOf(InvalidCredentialsError)

    })

})