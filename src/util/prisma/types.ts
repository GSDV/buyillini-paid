import { Prisma } from "@prisma/client";

export type UserWithItems = Prisma.UserGetPayload<{ include: {items: true} }>;