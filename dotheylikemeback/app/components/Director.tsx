"use client";

import { useUser } from "@clerk/nextjs";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext";
export function Director({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { isSignedIn } = useUser();
	const { username, verificationCode } = useUserContext();

	useEffect(() => {
		if (!isSignedIn) {
			router.push("/");
		} else if (!username) {
			router.push("/username");
		} else if (verificationCode) {
			router.push("/verify");
		}
	}, [isSignedIn, username, verificationCode, router]);

    return <>{children}</>;
}
