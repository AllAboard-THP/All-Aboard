"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ExternalLink, Hourglass, MapPin, Building2 } from "lucide-react";

import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyEvents,
  type LegacyEvent,
} from "./fixtures/legacy-events";
import { legacySubjects } from "./fixtures/legacy-subjects";
import { legacyDemoToast } from "./legacy-story-feedback";

const EVENTS_PAGE_SIZE = 2;

function filterEventsByPill(
  events: LegacyEvent[],
  pillId: string,
  generalLabel: string,
) {
  if (pillId === "all") return events;
  if (pillId === "general") {
    return events.filter(
      (event) =>
        event.category === generalLabel ||
        event.category === "Général" ||
        event.category === "General",
    );
  }

  const subject = legacySubjects.find((item) => item.slug === pillId);
  if (!subject) return events;

  return events.filter((event) => event.category === subject.name);
}

export function EventCard({
  event,
  labels = legacyLabelsFr,
  className,
}: {
  event: LegacyEvent;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "glass rounded-2xl p-5 transition-colors hover:bg-white/5",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-[56px] shrink-0 rounded-xl bg-white/10 px-3 py-2 text-center">
          <p className="text-xl leading-none font-bold text-accent">
            {event.dateDay}
          </p>
          <p className="text-xs text-muted-foreground uppercase">
            {event.dateMonth}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold transition-colors hover:text-accent">
              {event.title}
            </h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {event.eventType}
            </span>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
              {event.category}
            </span>
            {event.online ? (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                {labels.events.onlineBadge}
              </span>
            ) : null}
          </div>

          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {event.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {event.location}
              </span>
            ) : null}
            {event.organizer ? (
              <span className="flex items-center gap-1">
                <Building2 className="size-3" />
                {event.organizer}
              </span>
            ) : null}
          </div>
        </div>

        {event.externalUrl ? (
          <Button
            type="button"
            size="xs"
            className="shrink-0 bg-accent/20 text-accent hover:bg-accent/30"
            onClick={() => legacyDemoToast(labels.events.registerCta)}
          >
            {labels.events.registerCta}
            <ExternalLink data-icon="inline-end" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function EventCardList({
  events = legacyEvents,
  labels = legacyLabelsFr,
  className,
}: {
  events?: LegacyEvent[];
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} labels={labels} />
      ))}
    </div>
  );
}

export function FilterPillBar({
  labels = legacyLabelsFr,
  activeId: activeIdProp = "all",
  onActiveIdChange,
  className,
}: {
  labels?: LegacyLabels;
  activeId?: string;
  onActiveIdChange?: (id: string) => void;
  className?: string;
}) {
  const [internalActiveId, setInternalActiveId] = useState(activeIdProp);
  const activeId = onActiveIdChange ? activeIdProp : internalActiveId;

  useEffect(() => {
    if (!onActiveIdChange) {
      setInternalActiveId(activeIdProp);
    }
  }, [activeIdProp, onActiveIdChange]);

  const setActiveId = (id: string) => {
    onActiveIdChange?.(id);
    if (!onActiveIdChange) {
      setInternalActiveId(id);
    }
  };

  const pills = [
    { id: "all", label: labels.events.filterAll },
    { id: "general", label: labels.events.filterGeneral },
    ...legacySubjects.slice(0, 4).map((subject) => ({
      id: subject.slug,
      label: subject.name,
    })),
  ];

  return (
    <div className={cn("mb-8 flex flex-wrap gap-2", className)}>
      {pills.map((pill) => {
        const active = activeId === pill.id;

        return (
          <button
            key={pill.id}
            type="button"
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-white/10 text-muted-foreground hover:bg-white/20",
            )}
            onClick={() => setActiveId(pill.id)}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

export function PaginationBar({
  currentPage: currentPageProp = 1,
  totalPages = 3,
  onPageChange,
  className,
}: {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}) {
  const [internalPage, setInternalPage] = useState(currentPageProp);
  const currentPage = onPageChange ? currentPageProp : internalPage;

  useEffect(() => {
    if (!onPageChange) {
      setInternalPage(currentPageProp);
    }
  }, [currentPageProp, onPageChange]);

  const setPage = (page: number) => {
    onPageChange?.(page);
    if (!onPageChange) {
      setInternalPage(page);
    }
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className={cn("flex justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/10 disabled:opacity-40"
        onClick={() => setPage(Math.max(1, currentPage - 1))}
      >
        ‹
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cn(
            "min-w-8 rounded-lg px-3 py-1.5 text-sm transition-colors",
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-white/10",
          )}
          onClick={() => setPage(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/10 disabled:opacity-40"
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
      >
        ›
      </button>
    </nav>
  );
}

export function EventsPageHeader({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
        <Calendar className="size-7 text-accent" />
        {labels.events.title}
      </h1>
      <p className="text-muted-foreground">{labels.events.subtitle}</p>
    </div>
  );
}

export function EventsUpcomingSection({
  events = legacyEvents,
  labels = legacyLabelsFr,
  showPagination = false,
  className,
}: {
  events?: LegacyEvent[];
  labels?: LegacyLabels;
  showPagination?: boolean;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Hourglass className="size-4 text-accent" />
        {labels.events.upcomingTitle}
      </h2>
      <EventCardList events={events} labels={labels} />
      {showPagination ? (
        <PaginationBar className="mt-8" currentPage={1} totalPages={3} />
      ) : null}
    </section>
  );
}

export function EventsListWithFilters({
  events = legacyEvents,
  labels = legacyLabelsFr,
  showPagination = false,
  className,
}: {
  events?: LegacyEvent[];
  labels?: LegacyLabels;
  showPagination?: boolean;
  className?: string;
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(
    () => filterEventsByPill(events, activeFilter, labels.events.filterGeneral),
    [activeFilter, events, labels.events.filterGeneral],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageEvents = showPagination
    ? filteredEvents.slice(
        (safePage - 1) * EVENTS_PAGE_SIZE,
        safePage * EVENTS_PAGE_SIZE,
      )
    : filteredEvents;

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className={className}>
      <FilterPillBar
        labels={labels}
        activeId={activeFilter}
        onActiveIdChange={setActiveFilter}
      />
      <EventsUpcomingSection
        events={pageEvents}
        labels={labels}
        showPagination={false}
      />
      {showPagination && filteredEvents.length > EVENTS_PAGE_SIZE ? (
        <PaginationBar
          className="mt-8"
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
