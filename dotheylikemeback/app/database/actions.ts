'use server';

import postgres from "postgres";
import { currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import * as crypto from 'node:crypto'
const prisma = new PrismaClient()

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Creates a hash from two users, (order-independent)
function generatePairHash(userA: string, userB: string) {
	const sortedPair = [userA.toLowerCase(), userB.toLowerCase()].sort().join(":");
	return crypto.createHash("sha256").update(sortedPair).digest("hex");
}

// Creates a hash from a username and the account ID.
function generateUserHash(user: string, id: string) {
	return crypto.createHash("sha256").update(`${user}:${id}`).digest("hex");
}

module.exports = {
	generatePairHash,
	generateUserHash,
};

export async function test() {
	const user = await currentUser();
	console.log(user?.externalAccounts)
    console.log(user?.externalId)
}

function generateVerificationCode() {
	// Generates a 6-digit verification code
	return Math.floor(100000 + Math.random() * 900000).toString();
}

//After the clerk login, users must login with their Instagram username as well (as it is not saved in the database for confidentiality)
export async function login({
	instagramUsername,
	newCode = true
}: {
	instagramUsername: string;
	newCode: boolean
}) {
    const user = await currentUser();
	if (!user) {
		return {"error": "Not signed in"}
	}

	if (user.externalAccounts.length == 0) {
        return {"error": "Need external signIn."}
    } 
    const userHash = generateUserHash(instagramUsername, user.externalAccounts[0].externalId);
    const dbUser = await prisma.users.findFirst({
        where: {
            userHash: userHash
        }
    })

	if (dbUser) {
        if (!dbUser.verificationCode) {
            return {success: true}
        } else {
            if (newCode) {
                const verificationCode = generateVerificationCode();
                await prisma.users.update({
                    where: {
                        userHash: userHash
                    },
                    data: {
                        verificationCode: parseInt(verificationCode)
                    }
                })
                return {verificationCode: verificationCode}
            }
            return {error: "Verification code not receieved"}
        }
    } else {
        const usernameTaken = await prisma.usernameList.count({
            where: {
                username: instagramUsername
            }
        })
        if (usernameTaken > 0) {
            return {error: "Username already taken"}
        } else {
            const verificationCode = generateVerificationCode();
            await prisma.users.create({
                data: {
                    userHash: userHash,
                    username: instagramUsername,
                    verificationCode: parseInt(verificationCode),
                    timeCreated: new Date(),
                    timeCode: new Date(),
                }
            })
            return {verificationCode: verificationCode}
        }
    }
}

export async function submitCrush({
    username,
    crushUsername
}: {
    username: string,
    crushUsername: string
}) {
    const user = await currentUser();

    if (!user) {
        return {"error": "Not signed in"}
    }
    if (user.externalAccounts.length == 0) {
        return {"error": "Need external signIn."}
    } 
    const userHash = generateUserHash(username, user.externalAccounts[0].externalId);
    const pairHash = generatePairHash(username, crushUsername);
    const dbUser = await prisma.users.findFirst({
        where: {
            userHash: userHash
        }
    })

    if (!dbUser) {
        return {error: "User not found"}
    } else if (dbUser.verificationCode) {
        return {error: "User not verified"}
    } else if (dbUser.lastSubmit && (new Date().getTime() - dbUser.lastSubmit.getTime()) < 1000 * 60 * 60 * 24 * 30) {
        return {error: "You can only submit a crush once every 30 days"}
    }

    let match = await prisma.users.findFirst({
        where: {
            matchHash: pairHash,
            NOT: {
                userHash: userHash
            }
        }
    })

    if (match) {
        await prisma.users.update({
            where: {
                userHash: match.userHash
            },
            data: {
                matchHash: "-1"
            }
        })
        await prisma.users.update({
            where: {
                userHash: userHash
            },
            data: {
                matchHash: "-1"
            }
        })
    } else {
        await prisma.users.update({
            where: {
                userHash: userHash
            },
            data: {
                lastSubmit: new Date(),
                matchHash: pairHash
            }
        })
    }
    return {success: true}

}

export async function getStatus(username: string) {
    const user = await currentUser();
    if (!user) {
        return {"error": "Not signed in"}
    }
    if (user.externalAccounts.length == 0) {
        return {"error": "Need external signIn."}
    } 
    const userHash = generateUserHash(username, user.externalAccounts[0].externalId);
    const dbUser = await prisma.users.findFirst({
        where: {
            userHash: userHash
        }
    })

    if (!dbUser) {
        return {error: "User not found"}
    } else if (dbUser.verificationCode) {
        return {error: "User not verified"}
    }

    return {success: true, matched: dbUser.matchHash === "-1"}
}

//simulate instagram bot confirmation
export async function confirmUser(username: string) {
    //set verificationCode, username to NULL,
	await sql`UPDATE users SET verificationCode = NULL, username = NULL WHERE instagramUsername = ${username}`;
}
