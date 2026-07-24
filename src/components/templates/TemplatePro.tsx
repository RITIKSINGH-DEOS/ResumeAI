import type { ResumeData } from "./types";

type Props = { data: ResumeData };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 2,
        color: "#999",
        margin: "0 0 10px",
      }}
    >
      {children}
    </h3>
  );
}

export function TemplatePro({ data }: Props) {
  const { personal, summary, experience, skills, projects, achievements, education } = data;

  const contactItems = [
    personal.email && { icon: "📧", value: personal.email, href: `mailto:${personal.email}` },
    personal.linkedin && { icon: "🔗", value: personal.linkedin, href: personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}` },
    personal.address && { icon: "📍", value: personal.address },
    personal.phone && { icon: "📞", value: personal.phone },
    personal.github && { icon: "💻", value: personal.github, href: personal.github.startsWith("http") ? personal.github : `https://${personal.github}` },
    personal.portfolio && { icon: "🌐", value: personal.portfolio, href: personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}` },
  ].filter(Boolean) as { icon: string; value: string; href?: string }[];

  const tagline = skills
    .flatMap((s) => s.items)
    .filter(Boolean)
    .slice(0, 5)
    .join(" | ");

  const hasRight = achievements.some((a) => a.title || a.description) ||
    skills.some((s) => s.category || s.items.some(Boolean)) ||
    education.some((e) => e.institute || e.degree);

  return (
    <div
      id="resume-template"
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        background: "#fff",
        color: "#222",
        fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif",
        fontSize: 12.5,
        lineHeight: 1.6,
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: "28px 32px 18px", borderBottom: "1px solid #eee" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#1a1a1a",
            margin: 0,
            fontFamily: "'Syne', 'DM Sans', sans-serif",
          }}
        >
          {personal.name || "Your Name"}
        </h1>
        {tagline && (
          <p style={{ fontSize: 12, color: "#f97316", margin: "4px 0 0", fontWeight: 500 }}>
            {tagline}
          </p>
        )}
        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 16px",
              marginTop: 10,
              fontSize: 11.5,
              color: "#555",
            }}
          >
            {contactItems.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{c.icon}</span>
                {c.href ? (
                  <a href={c.href} style={{ color: "#555", textDecoration: "none" }}>{c.value}</a>
                ) : (
                  c.value
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", minHeight: 400 }}>
        {/* Left column (65%) */}
        <div style={{ flex: "0 0 65%", padding: "22px 28px 28px 32px" }}>
          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: 22 }}>
              <SectionTitle>Summary</SectionTitle>
              <p style={{ margin: 0, color: "#444", lineHeight: 1.65 }}>{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.some((e) => e.company || e.role) && (
            <div style={{ marginBottom: 22 }}>
              <SectionTitle>Experience</SectionTitle>
              {experience.map((ex, i) => {
                if (!ex.company && !ex.role) return null;
                return (
                  <div key={i} style={{ marginBottom: i < experience.length - 1 ? 18 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 13 }}>{ex.role}</span>
                        {ex.company && (
                          <span style={{ color: "#f97316", marginLeft: 6, fontSize: 12.5, fontWeight: 500 }}>
                            {ex.company}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap" }}>
                        {ex.location && <>{ex.location} · </>}
                        {ex.duration}
                      </span>
                    </div>
                    {ex.points.some(Boolean) && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 16, listStyle: "disc" }}>
                        {ex.points.filter(Boolean).map((p, j) => (
                          <li key={j} style={{ marginBottom: 2, color: "#444", fontSize: 12 }}>{p}</li>
                        ))}
                      </ul>
                    )}
                    {i < experience.length - 1 && (
                      <div style={{ borderBottom: "1px solid #eee", marginTop: 14 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {projects.some((p) => p.title) && (
            <div style={{ marginBottom: 22 }}>
              <SectionTitle>Projects</SectionTitle>
              {projects.map((pr, i) => {
                if (!pr.title) return null;
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>
                        {pr.link ? (
                          <a href={pr.link.startsWith("http") ? pr.link : `https://${pr.link}`} style={{ color: "#1a1a1a", textDecoration: "none" }}>
                            {pr.title}
                          </a>
                        ) : pr.title}
                        {pr.tech && <span style={{ fontWeight: 400, color: "#888", fontSize: 11.5, marginLeft: 6 }}>({pr.tech})</span>}
                      </span>
                      {pr.date && <span style={{ fontSize: 11, color: "#999" }}>{pr.date}</span>}
                    </div>
                    {pr.points.some(Boolean) && (
                      <ul style={{ margin: "4px 0 0", paddingLeft: 16, listStyle: "disc" }}>
                        {pr.points.filter(Boolean).map((p, j) => (
                          <li key={j} style={{ color: "#444", fontSize: 12, marginBottom: 2 }}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column (35%) */}
        {hasRight && (
          <div
            style={{
              flex: "0 0 35%",
              background: "#f8f8f8",
              padding: "22px 24px 28px",
              borderLeft: "1px solid #eee",
            }}
          >
            {/* Key achievements */}
            {achievements.some((a) => a.title || a.description) && (
              <div style={{ marginBottom: 24 }}>
                <SectionTitle>Key Achievements</SectionTitle>
                {achievements.map((ach, i) => {
                  if (!ach.title && !ach.description) return null;
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "#f97316",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>★</span>
                      </div>
                      <div>
                        {ach.title && (
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: "#1a1a1a" }}>
                            {ach.title}
                          </p>
                        )}
                        {ach.description && (
                          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#666" }}>
                            {ach.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Core Competencies */}
            {skills.some((s) => s.items.some(Boolean)) && (
              <div style={{ marginBottom: 24 }}>
                <SectionTitle>Core Competencies</SectionTitle>
                <p style={{ margin: 0, fontSize: 12, color: "#444", lineHeight: 1.7 }}>
                  {skills.flatMap((s) => s.items).filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Education */}
            {education.some((e) => e.institute || e.degree) && (
              <div style={{ marginBottom: 24 }}>
                <SectionTitle>Education</SectionTitle>
                {education.map((ed, i) => {
                  if (!ed.institute && !ed.degree) return null;
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: "#1a1a1a" }}>
                        {ed.degree}
                      </p>
                      <p style={{ margin: 0, fontSize: 11.5, color: "#666" }}>{ed.institute}</p>
                      {(ed.duration || ed.cgpa) && (
                        <p style={{ margin: 0, fontSize: 11, color: "#999" }}>
                          {[ed.duration, ed.cgpa && `CGPA: ${ed.cgpa}`].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Training / courses → show projects on right if no achievements */}
            {!achievements.some((a) => a.title || a.description) && projects.some((p) => p.title) && (
              <div style={{ marginBottom: 24 }}>
                <SectionTitle>Training &amp; Courses</SectionTitle>
                {projects.filter((p) => p.title).map((pr, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#f97316" }}>
                      {pr.title}
                    </p>
                    {pr.tech && (
                      <p style={{ margin: 0, fontSize: 11.5, color: "#666" }}>{pr.tech}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
