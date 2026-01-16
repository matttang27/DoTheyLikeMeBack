"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "../context/userContext";
import { getStatus, submitCrush } from "../database/actions";
import { useEffect, useState } from "react";

export default function Status() {
  const { username } = useUserContext();
  const [crushUsername, setCrushUsername] = useState("");
  const [match, setMatch] = useState<boolean|undefined>(undefined);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStatus() {
      if (username) {
        try {
          const statusResponse = await getStatus(username);
          console.log(statusResponse)
          if (statusResponse.error) {
            setError(statusResponse.error);
          } else {
            setMatch(statusResponse.matched); // assuming response has a "match" boolean
          }
        } catch (err) {
          setError("Failed to retrieve status");
        }
        setLoading(false);
      }
    }
    fetchStatus();
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitCrush({ username: username!, crushUsername });
      if (res.error) {
        setError(res.error);
      } else {
        // Optionally re-fetch status after submission
        const statusResponse = await getStatus(username!);
        if (statusResponse.error) {
          setError(statusResponse.error);
        } else {
          setMatch(statusResponse.matched);
        }
      }
    } catch (err) {
      setError("Submission failed");
    }
  };

  return (
    <div className="p-6">
      <h1>Status</h1>
      {loading ? (
        <p>Loading status...</p>
      ) : (
        <>
          {error && <p className="text-red-500">{error}</p>}
          {match !== null && (
            <p>Your match status: {match ? "Matched!" : "Not Matched Yet"}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              placeholder="Enter crush username"
              value={crushUsername}
              onChange={(e) => setCrushUsername(e.target.value)}
              className="border p-2"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded ml-2"
            >
              Submit Crush
            </button>
          </form>
        </>
      )}
    </div>
  );
}