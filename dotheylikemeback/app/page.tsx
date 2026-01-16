"use client";
import { useRouter } from "next/navigation";

import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";
import { useUserContext } from "./context/userContext";
export default function Home() {
	const router = useRouter();
  const {username, verificationCode} = useUserContext();

  let path = ""
  let text = ""
  if (verificationCode) {
    path = "/verify"
    text = "Verify your instagram account"
  } else if (!username) {
    path = "/username"
    text = "Enter your instagram username"
  } else {
    path = "/status"
    text = "Did you match?"
  }
	return (
		<div>
			<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
				<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
					<h1>Do They Like Me Back?</h1>
					<SignedIn>
						<button
							onClick={() => {
                router.push(path)}}
							className="px-4 py-2 bg-blue-500 text-white rounded"
						>
							{text}
						</button>
					</SignedIn>
				</main>
			</div>
		</div>
	);
}
