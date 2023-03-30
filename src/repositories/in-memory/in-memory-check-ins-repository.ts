import { Prisma, CheckIn } from "@prisma/client"
import dayjs from "dayjs";
import { randomUUID } from "node:crypto";
import { CheckInsRepository } from "../check-ins-repository";

export class InMemoryCheckInsRepository implements CheckInsRepository {

    public items: CheckIn[] = []

    async findByUserIdOnDate(userId: string, date: Date) {

        const startOfTheDay = dayjs(date).startOf("date")

        const finalOfTheDay = dayjs(date).endOf("date")

        const checkInOnSameDate = this.items.find(checkin => {

            const checkInDate = dayjs(checkin.created_at)

            const isOnSameDay = checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(finalOfTheDay)

            return checkin.user_id === userId && isOnSameDay
        })

        if (!checkInOnSameDate) {
            return null
        }

        return checkInOnSameDate
    }

    async create(data: Prisma.CheckInUncheckedCreateInput) {
        const checkIn = {
            id: randomUUID(),
            user_id: data.user_id,
            gym_id: data.gym_id,
            validated_at: data.validated_at ? new Date(data.validated_at) : null,
            created_at: new Date()
        }

        this.items.push(checkIn)

        return checkIn
    }
}