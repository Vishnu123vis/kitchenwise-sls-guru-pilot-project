"use client";
import { Authenticator } from "@aws-amplify/ui-react";
import Dashboard from "../components/Dashboard";
import LogoutButton from "../components/LogoutButton";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>KitchenWise</h1>
      <p style={{ marginBottom: 24, color: "#475569", textAlign: "center" }}>
        Sign up or sign in to get started.
      </p>
      <Authenticator>
        {() => (
          <>
            <Dashboard />
            <LogoutButton />
          </>
        )}
      </Authenticator>
    </main>
  );
}
