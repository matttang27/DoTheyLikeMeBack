"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext";

const protectedRoutes = ["/username", "/verify", "/status"];

export function Director({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  useEffect(() => {
    // If the user is not signed in and the current path is protected, push to the home page.
    if (!isSignedIn && protectedRoutes.includes(pathname)) {
      console.log("GO HOME")
    }
  }, [isSignedIn, pathname, router]);

  if (!isSignedIn && protectedRoutes.includes(pathname)) return null;

  return <>{children}</>;
}