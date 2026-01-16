"use client"
import { useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext"
import { login } from "../database/actions";
import { useState } from "react";
export default function Verify() {
    const router = useRouter();
    const [error, setError] = useState("");
    let {verificationCode, username, setVerificationCode} = useUserContext();
    console.log(username)
    

    const sendLogin = async (newCode: boolean) => {
        let response = await login({ instagramUsername: username!, newCode: true});
        response.error ? setError(response.error) : setError("");

        if (response.verificationCode) {setVerificationCode(response.verificationCode)}
        if (response.success) {router.push("/status")}
    }
    const sendVerify = async () => {await sendLogin(false)}
    const sendNew = async () => {await sendLogin(true)}


    
    return (
        <div>
            <h2>Verify your account by sending the code below to @dotheylikemeback on Instagram</h2>
            <p>verificationCode:</p>
            <p>{verificationCode}</p>
            <button onClick={sendVerify}>Send a new code</button>
            <button onClick={sendNew}>Verify</button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}