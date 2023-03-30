import { CheckIn } from "@prisma/client";
import { CheckInsRepository } from "../repositories/check-ins-repository";
import { GymsRepository } from "../repositories/gyms-repository";
import { getDistanceBetweenCoordinates } from "../utils/get-distance-between-coordinates";
import { MaxDistanceError } from "./errors/max-distance-error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";
import { ResourceNotFoundError } from "./errors/resource-not-found";

interface FetchUserCheckInUseCaseRequest {
    userId: string;
}

interface FetchUserCheckInUseCaseResponse {
    checkIns: CheckIn[]
}

export class FetchUserCheckInUseCase {
    constructor(private checkInsRepository: CheckInsRepository) { }

    async execute({ userId }: FetchUserCheckInUseCaseRequest): Promise<FetchUserCheckInUseCaseResponse> {

        const gym = await this.checkInsRepository.findById(gymId)

        if (!gym) {
            throw new ResourceNotFoundError()
        }

        const distance = getDistanceBetweenCoordinates({
            latitude: userLatitude,
            longitude: userLongitude
        }, {
            latitude: gym.latitude.toNumber(),
            longitude: gym.longitude.toNumber()
        })

        const MAX_DISTANCE_IN_KILOMETERS = 0.1

        if (distance > MAX_DISTANCE_IN_KILOMETERS) {
            throw new MaxDistanceError()
        }

        const checkInOnSameDay = await this.checkInsRepository.findByUserIdOnDate(
            userId,
            new Date()
        )

        if (checkInOnSameDay) {
            throw new MaxNumberOfCheckInsError()
        }

        const checkIn = await this.checkInsRepository.create({
            gym_id: gymId,
            user_id: userId
        })

        return {
            checkIn
        }
    }
}