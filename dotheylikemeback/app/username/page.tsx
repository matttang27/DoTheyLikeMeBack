"use client";

import { useState } from "react";
import { useUserContext } from "../context/userContext";
import { useRouter } from "next/navigation";
import { login} from "../database/actions";

export default function Username() {
	const [instagramUsername, setInstagramUsername] = useState("");
	const router = useRouter();
	const [error, setError] = useState("");
	let { setUsername, setVerificationCode } = useUserContext();
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setUsername(instagramUsername);

		let response = await login({ instagramUsername, newCode: true });
		response.error ? setError(response.error) : setError("");
		if (response.verificationCode) {
			setVerificationCode(response.verificationCode);
			router.push("/verify");
		}
		if (response.success) {
			router.push("/status");
		}
	};
	

	return (
		<form onSubmit={handleSubmit} className="p-6">
			<input
				type="text"
				placeholder="Instagram username"
				value={instagramUsername}
				onChange={(e) => setInstagramUsername(e.target.value)}
				className="border p-2"
			/>
			<button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
				Continue
			</button>
			{error && <p className="text-red-500 mt-2">{error}</p>}
		</form>
	);
}
