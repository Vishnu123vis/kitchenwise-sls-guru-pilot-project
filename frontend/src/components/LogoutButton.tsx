"use client";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import styles from './LogoutButton.module.css';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      className={styles.logoutButton}
    >
      🚪 Log out
    </button>
  );
}
