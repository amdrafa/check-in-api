import { Decimal } from "@prisma/client/runtime/binary"
import { compare } from "bcryptjs"
import { expect, it, describe, beforeEach, vi, afterEach } from "vitest"
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-check-ins-repository"
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository"
import { CheckInUseCase } from "./check-in"
import { MaxDistanceError } from "./errors/max-distance-error"
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error"

let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
let gymsRepository: InMemoryGymsRepository

describe("Check-in use case", () => {

    beforeEach(async () => {
        checkInsRepository = new InMemoryCheckInsRepository()
        gymsRepository = new InMemoryGymsRepository()
        sut = new CheckInUseCase(checkInsRepository, gymsRepository)

        await gymsRepository.create({
            id: "gym-01",
            title: "JavaScript Gym",
            description: "",
            phone: "",
            latitude: -26.9079864,
            longitude: -48.6689706
        })


        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("should be able to check in", async () => {

        const { checkIn } = await sut.execute({
            gymId: "gym-01",
            userId: "user-01",
            userLatitude: -26.9079864,
            userLongitude: -48.6689706
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it("should not be able to check in twice in the same day", async () => {

        vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

        await sut.execute({
            gymId: "gym-01",
            userId: "user-01",
            userLatitude: -26.9079864,
            userLongitude: -48.6689706
        })

        await expect(() => sut.execute({
            gymId: "gym-01",
            userId: "user-01",
            userLatitude: -26.9079864,
            userLongitude: -48.6689706
        })).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
    })

    it("should be able to check in twice but in different days", async () => {

        vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

        await sut.execute({
            gymId: "gym-01",
            userId: "user-01",
            userLatitude: -26.9079864,
            userLongitude: -48.6689706
        })

        vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

        const { checkIn } = await sut.execute({
            gymId: "gym-01",
            userId: "user-01",
            userLatitude: -26.9079864,
            userLongitude: -48.6689706
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it("should not be able to check in on distant gym", async () => {

        gymsRepository.items.push({
            id: "gym-02",
            title: "JavaScript Gym",
            description: "",
            phone: "",
            latitude: new Decimal(-26.9506115),
            longitude: new Decimal(-48.6848715)
        })



        await expect(() =>
            sut.execute({
                gymId: "gym-02",
                userId: "user-01",
                userLatitude: -26.9079864,
                userLongitude: -48.6689706
            })
        ).rejects.toBeInstanceOf(MaxDistanceError)
    })

})