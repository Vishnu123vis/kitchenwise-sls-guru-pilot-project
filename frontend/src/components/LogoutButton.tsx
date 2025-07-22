"use client";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      style={{ marginTop: 24, padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#fff", color: "#2563eb", border: "1px solid #2563eb", cursor: "pointer" }}
    >
      Log out
    </button>
  );
}
