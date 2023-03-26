import type { EventLog, Prisma} from "@prisma/client";
import { prisma } from "~/db.server";

export type { EventLog } from "@prisma/client";
 
export interface EventLogContent extends Prisma.JsonObject {
  description: string;
  
}

//export type EventType = "CP" | "UP" | "DP" | "U";
export enum EventType {
    CreateProduct = "CP",
    UpdateProduct = "UP",
    DeleteProduct = "DP",

    CreateReview = "CR",
    UpdateReview = "UR",
    DeleteReview = "DR",

    CreateUser = "CU",
    UpdateUser = "UU",
    DeleteUser = "DU",
}
    
export function getAllEventLogs() {
    return prisma.eventLog.findMany();
}

export function addEventLog({
    eventLog,
    logContent
}: {
        eventLog: Omit<EventLog, "eventLogId" | "content">
        logContent: EventLogContent
    }) {

    return prisma.eventLog.create({
        data: {
            ...eventLog,
            content: {
                ...logContent,
            }
        }
    });
}

export function findEventLogs(
    search: string[],
    timePrevious: string,
    timeNext: string,
    typeQuery: string[]
) {
    const previous = timePrevious === "" ? new Date(2022, 1, 1) : new Date(timePrevious);

    let next: Date;
    if (timeNext === "") { 
        next = new Date();
    } else {
        next = new Date(timeNext);
        next.setHours(23);
        next.setMinutes(59);
        next.setSeconds(59);
    }

    return prisma.eventLog.findMany({
        where: {
            eventLogDate: {
                lte: next,
                gte: previous,
            },
            AND: [{
                OR: search.map((stringsearch) => ({
                    content: {
                        path: ['description'],
                        string_contains: stringsearch,
                    },
                })),
                AND: [{
                    OR: typeQuery.map((type) => ({
                        content: {
                            path: ['type'],
                            string_contains: type,
                        },
                    }))
            }]
            }]
            
        }
    });
}