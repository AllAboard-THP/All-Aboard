"use client";

import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  type LegalPageContent,
  type LegalSection,
} from "./fixtures/legacy-legal-content";
import { BrandLogo } from "./legacy-ui";

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-primary">{section.title}</h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
      {section.listItems ? (
        <ul className="ml-2 list-inside list-disc space-y-2 text-muted-foreground">
          {section.listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function LegalPageLayout({
  content,
  labels = legacyLabelsFr,
  className,
}: {
  content: LegalPageContent;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "glass mx-auto max-w-3xl space-y-8 rounded-2xl p-8 md:p-12",
        className,
      )}
    >
      <header className="border-b border-white/10 pb-6">
        <BrandLogo labels={labels} className="mb-3" />
        <h1 className="mb-2 text-3xl font-extrabold">{content.title}</h1>
        <p className="text-sm text-muted-foreground">
          {labels.legal.updatedPrefix} {content.updatedAt}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {content.sections.map((section) => (
          <LegalSectionBlock key={section.title} section={section} />
        ))}
      </div>

      <footer className="flex flex-wrap gap-4 border-t border-white/10 pt-6 text-sm text-muted-foreground">
        <button type="button" className="transition-colors hover:text-foreground">
          {labels.legal.back}
        </button>
        <span aria-hidden>•</span>
        <button type="button" className="transition-colors hover:text-foreground">
          {labels.legal.privacyLink}
        </button>
        <span aria-hidden>•</span>
        <button type="button" className="transition-colors hover:text-foreground">
          {labels.legal.legalLink}
        </button>
      </footer>
    </article>
  );
}
