import { compare } from "bcryptjs"
import { expect, it, describe, beforeEach } from "vitest"
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository"
import { PrismaUsersRepository } from "../repositories/prisma/prisma-users-repository"
import { ResourceNotFoundError } from "./errors/resource-not-found"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"
import { GetUserProfileUseCase } from "./get-user-profile"
import { RegisterUseCase } from "./register"

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe("Get user profile use case", () => {

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new GetUserProfileUseCase(usersRepository)
    })

    it("should be able to get user profile", async () => {

        const createdUser = await usersRepository.create({
            name: "John Doe",
            email: "johndoe@exemple.com",
            password_hash: "123455"
        })

        const { user } = await sut.execute({
            userId: createdUser.id
        })

        expect(user.id).toEqual(expect.any(String))
        expect(user.name).toEqual("John Doe")
    })

    it("should be able to get user profile with wrong id", async () => {

        expect(async () => {
            await sut.execute({
                userId: "non-existing-id"
            })
        }).rejects.toBeInstanceOf(ResourceNotFoundError)
    })



})