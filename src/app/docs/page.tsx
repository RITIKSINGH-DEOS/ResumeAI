import type { Metadata } from "next";
import { DocsPageClient } from "./DocsPageClient";

export const metadata: Metadata = {
  title: "Documentation · ResumeAI",
  description:
    "Getting started, features, scoring, resume report and career guide, pricing, privacy, and FAQs for ResumeAI.",
};

export default function DocsPage() {
  return <DocsPageClient />;
}
