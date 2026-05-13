import type { FeedResponse } from "@allaboard/types";
import { FeedClientPreview } from "@/components/feed-client-preview";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
};

export function HomeContent({ feed, feedError }: Props) {
  return (
    <main
      data-testid="r1-home-main"
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
          maxWidth: "760px",
          borderRadius: "20px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(8px)",
          padding: "32px",
          boxShadow: "0 24px 80px rgba(2, 6, 23, 0.6)",
        }}
        aria-label="Etat du site All-Aboard"
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
          All-Aboard
        </p>
        <h1
          style={{
            marginTop: "14px",
            marginBottom: "12px",
            lineHeight: 1.1,
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
          }}
        >
          Site en construction
        </h1>
        <p
          style={{
            margin: 0,
            color: "#cbd5e1",
            maxWidth: "62ch",
            lineHeight: 1.65,
          }}
        >
          L&apos;espace ou les etudiants s&apos;aident vraiment. Publiez une requete,
          recevez des reponses ciblees et partagez vos savoirs. Version en
          preparation, ouverture prochaine.
        </p>

        <div
          style={{
            marginTop: "22px",
            borderRadius: "12px",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            background: "rgba(6, 78, 59, 0.25)",
            padding: "14px 16px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6ee7b7",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Feed API (SSR)
          </p>
          {feedError ? (
            <p
              style={{ margin: "8px 0 0", color: "#fca5a5", fontSize: "14px" }}
              data-testid="feed-ssr-error"
            >
              {feedError}
            </p>
          ) : feed ? (
            <ul
              style={{
                margin: "10px 0 0",
                paddingLeft: "18px",
                color: "#e2e8f0",
                fontSize: "14px",
              }}
              data-testid="feed-ssr-list"
            >
              {feed.items.map((item) => (
                <li key={item.id} style={{ marginBottom: "6px" }}>
                  {item.title}
                </li>
              ))}
            </ul>
          ) : null}
          <p
            style={{
              margin: "12px 0 0",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Données issues de <code>GET /feed</code> via{" "}
            <code style={{ color: "#cbd5e1" }}>API_URL</code> (cache Next{" "}
            <code style={{ color: "#cbd5e1" }}>revalidate: 60</code>).
          </p>
          <FeedClientPreview />
        </div>

        <div
          style={{
            marginTop: "22px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "999px",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            background: "rgba(6, 78, 59, 0.35)",
            color: "#6ee7b7",
            padding: "8px 14px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">●</span>
          <span>Lancement MVP en preparation</span>
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          <article
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              background: "rgba(30, 41, 59, 0.45)",
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#818cf8",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Feed social cible
            </p>
            <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "14px" }}>
              Requetes et reponses triees par pertinence.
            </p>
          </article>
          <article
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              background: "rgba(30, 41, 59, 0.45)",
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#c084fc",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Chat temps reel
            </p>
            <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "14px" }}>
              Echanges rapides avec la communaute.
            </p>
          </article>
          <article
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(45, 212, 191, 0.35)",
              background: "rgba(30, 41, 59, 0.45)",
              padding: "12px 14px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#2dd4bf",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Exploration par matiere
            </p>
            <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "14px" }}>
              Trouvez l&apos;aide par theme et niveau.
            </p>
          </article>
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="mailto:contact@allaboard.app"
            style={{
              textDecoration: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Nous contacter
          </a>
          <a
            href="/health"
            style={{
              textDecoration: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              color: "#e2e8f0",
              fontWeight: 600,
            }}
          >
            Statut technique
          </a>
        </div>
      </section>
    </main>
  );
}
