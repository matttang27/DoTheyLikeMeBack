'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

interface UserData {
  username: string | null;
  verificationCode: string | null;
  setUsername: (username: string | null) => void;
  setVerificationCode: (code: string | null) => void;
}

const UserContext = createContext<UserData>({
  username: null,
  verificationCode: null,
  setUsername: () => {},
  setVerificationCode: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{ username, verificationCode, setUsername, setVerificationCode }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}

