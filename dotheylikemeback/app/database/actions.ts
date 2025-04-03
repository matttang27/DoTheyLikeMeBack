"use server"

import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, {ssl: "require"});

export async function test() {
    const a = await sql`SELECT * FROM users`;
    console.log(a);
}