import type { ResumeData } from "./types";

type Props = { data: ResumeData };

const FONT = "'EB Garamond', Georgia, 'Times New Roman', serif";

const sectionStyle: React.CSSProperties = {
  marginBottom: 12,
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          margin: "0 0 1px",
          fontFamily: FONT,
          color: "#1a1a1a",
        }}
      >
        {children}
      </h3>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #1a1a1a",
          margin: "2px 0 8px",
        }}
      />
    </div>
  );
}

function Row({
  left,
  right,
  bold = false,
  italic = false,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        flexWrap: "wrap",
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      <span>{left}</span>
      {right && <span style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap" }}>{right}</span>}
    </div>
  );
}

export function TemplateLatex({ data }: Props) {
  const { personal, summary, experience, skills, projects, achievements, education } = data;

  const contactParts: React.ReactNode[] = [];
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.email)
    contactParts.push(
      <a key="e" href={`mailto:${personal.email}`} style={{ color: "inherit", textDecoration: "none" }}>
        {personal.email}
      </a>
    );
  if (personal.linkedin)
    contactParts.push(
      <a
        key="l"
        href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {personal.linkedin.replace(/^https?:\/\//, "")}
      </a>
    );
  if (personal.github)
    contactParts.push(
      <a
        key="g"
        href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {personal.github.replace(/^https?:\/\//, "")}
      </a>
    );
  if (personal.portfolio)
    contactParts.push(
      <a
        key="p"
        href={personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {personal.portfolio.replace(/^https?:\/\//, "")}
      </a>
    );

  return (
    <div
      id="resume-template"
      style={{
        width: "100%",
        maxWidth: 780,
        margin: "0 auto",
        background: "#fff",
        color: "#1a1a1a",
        fontFamily: FONT,
        fontSize: 11.5,
        lineHeight: 1.55,
        padding: "32px 40px 36px",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <h1
          style={{
            fontVariant: "small-caps",
            fontSize: 28,
            letterSpacing: 4,
            fontWeight: 700,
            margin: 0,
            fontFamily: FONT,
            color: "#1a1a1a",
          }}
        >
          {personal.name || "Your Name"}
        </h1>
        {personal.address && (
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#666" }}>
            {personal.address}
          </p>
        )}
        {contactParts.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#333" }}>
            {contactParts.map((cp, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 6px", color: "#999" }}>|</span>}
                {cp}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* ── Summary ── */}
      {summary && (
        <>
          <SectionHeading>Summary</SectionHeading>
          <p style={{ margin: "0 0 12px", color: "#333" }}>{summary}</p>
        </>
      )}

      {/* ── Education ── */}
      {education.some((e) => e.institute || e.degree) && (
        <>
          <SectionHeading>Education</SectionHeading>
          {education.map((ed, i) => {
            if (!ed.institute && !ed.degree) return null;
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <Row left={<strong>{ed.institute}</strong>} right={ed.duration} bold />
                {ed.degree && (
                  <div style={{ fontStyle: "italic", fontSize: 11.5, color: "#333" }}>
                    {ed.degree}
                    {ed.cgpa && <> — CGPA: {ed.cgpa}</>}
                    {ed.location && <>, {ed.location}</>}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── Experience ── */}
      {experience.some((e) => e.company || e.role) && (
        <>
          <SectionHeading>Experience</SectionHeading>
          {experience.map((ex, i) => {
            if (!ex.company && !ex.role) return null;
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <Row
                  left={
                    <span>
                      <strong>{ex.company}</strong>
                      {ex.role && <> | {ex.role}</>}
                    </span>
                  }
                  right={ex.duration}
                  bold
                />
                {ex.location && (
                  <div style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>
                    {ex.location}
                  </div>
                )}
                {ex.points.some(Boolean) && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: 18,
                      listStyleType: "'• '",
                    }}
                  >
                    {ex.points.filter(Boolean).map((p, j) => (
                      <li
                        key={j}
                        style={{ paddingLeft: 2, marginBottom: 1, color: "#333" }}
                        dangerouslySetInnerHTML={{
                          __html: p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── Skills ── */}
      {skills.some((s) => s.category || s.items.some(Boolean)) && (
        <>
          <SectionHeading>Skills</SectionHeading>
          {skills.map((sk, i) => {
            const items = sk.items.filter(Boolean).join(", ");
            if (!sk.category && !items) return null;
            return (
              <p key={i} style={{ margin: "0 0 3px", color: "#333" }}>
                {sk.category && <strong>{sk.category}: </strong>}
                {items}
              </p>
            );
          })}
          <div style={{ height: 10 }} />
        </>
      )}

      {/* ── Projects ── */}
      {projects.some((p) => p.title) && (
        <>
          <SectionHeading>Projects</SectionHeading>
          {projects.map((pr, i) => {
            if (!pr.title) return null;
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <Row
                  left={
                    <span>
                      <em>
                        {pr.link ? (
                          <a
                            href={pr.link.startsWith("http") ? pr.link : `https://${pr.link}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {pr.title}
                          </a>
                        ) : (
                          pr.title
                        )}
                      </em>
                      {pr.tech && (
                        <span style={{ fontStyle: "italic", color: "#555" }}> | {pr.tech}</span>
                      )}
                    </span>
                  }
                  right={pr.date}
                />
                {pr.points.some(Boolean) && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: 18,
                      listStyleType: "'• '",
                    }}
                  >
                    {pr.points.filter(Boolean).map((p, j) => (
                      <li
                        key={j}
                        style={{ paddingLeft: 2, marginBottom: 1, color: "#333" }}
                        dangerouslySetInnerHTML={{
                          __html: p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── Achievements ── */}
      {achievements.some((a) => a.title || a.description) && (
        <>
          <SectionHeading>Achievements</SectionHeading>
          {achievements.map((ach, i) => {
            if (!ach.title && !ach.description) return null;
            return (
              <p key={i} style={{ margin: "0 0 4px", color: "#333" }}>
                {ach.title && <strong>{ach.title}: </strong>}
                {ach.description}
              </p>
            );
          })}
        </>
      )}
    </div>
  );
}
