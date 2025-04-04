"use server";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { useUserContext } from "../context/userContext";
import { escape } from "querystring";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

const crypto = require("crypto");

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
	const a = await sql`SELECT * FROM users`;
	console.log(a);
}

function generateVerificationCode() {
	// Generates a 6-digit verification code
	return Math.floor(100000 + Math.random() * 900000).toString();
}

//After the clerk login, users must login with their Instagram username as well (as it is not saved in the database for confidentiality)
export async function login({
	instagramUsername,
	newCode = true,
}: {
	instagramUsername: string;
	newCode: boolean;
}) {
    const { setVerificationCode } = useUserContext();
	const { user } = useUser();
	if (!user) {
		return {"error": "Not signed in"}
	}

	const userHash = generateUserHash(instagramUsername, user.id);
	const foundUser = await sql`SELECT * FROM users WHERE userHash = ${userHash}`;

	if (foundUser.length > 0) {
        if (!foundUser[0].verificationCode) {
            redirect("/status")
        } else {
            if (newCode) {
                const verificationCode = generateVerificationCode();
                await sql`UPDATE users SET verificationCode = ${verificationCode} WHERE userHash = ${userHash}`;
                setVerificationCode(verificationCode);
            }
            redirect("/verify")
        }
    } else {
        const usernameTaken = await sql`COUNT(*) FROM usernameList WHERE username = ${instagramUsername}`;
        if (usernameTaken[0].count > 0) {
            return {error: "Username already taken"}
        } else {
            const verificationCode = generateVerificationCode();
            await sql`INSERT INTO users (userHash, instagramUsername, verificationCode) VALUES (${userHash}, ${instagramUsername}, ${verificationCode})`;
            setVerificationCode(verificationCode);
            redirect("/verify")
        }
    }
}

//simulate instagram bot confirmation
export async function confirmUser(username: string) {
    //set verificationCode, username to NULL,
	await sql`UPDATE users SET verificationCode = NULL, username = NULL WHERE instagramUsername = ${username}`;
}
