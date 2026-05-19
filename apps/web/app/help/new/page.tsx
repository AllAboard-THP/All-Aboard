import Link from "next/link";
import { HelpRequestForm } from "@/components/help-request-form";

export default function NewHelpRequestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        color: "#f8fafc",
        background:
          "radial-gradient(90% 80% at 20% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0) 60%), #020617",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "20px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(15, 23, 42, 0.85)",
          padding: "28px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#a5b4fc",
            fontSize: "12px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Nouvelle demande
        </p>
        <h1 style={{ marginTop: "12px", fontSize: "1.5rem" }}>
          Publier une demande d&apos;aide
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
          Connexion MVP (ADR 0001), puis envoi vers l&apos;API via le BFF{" "}
          <code style={{ color: "#cbd5e1" }}>/api/help-requests</code>.
        </p>
        <HelpRequestForm />
        <p style={{ marginTop: "20px" }}>
          <Link
            href="/"
            style={{ color: "#818cf8", fontWeight: 600, fontSize: "14px" }}
          >
            Retour accueil
          </Link>
        </p>
      </section>
    </main>
  );
}
