import { Prisma } from '@prisma/client';

// export type UserWithPosts = Prisma.UserGetPayload<{ include: {posts: true} }>;
export type RedactedUser = Prisma.UserGetPayload<{ omit: {password: true, salt: true} }>;
export type RedactedUserWithPosts = Prisma.UserGetPayload<{ omit: {password: true, salt: true}, include: {posts: true} }>;
export type PostWithRedactedUser = Prisma.PostGetPayload<{ include: {seller: {omit: {password: true, salt: true}}} }>;