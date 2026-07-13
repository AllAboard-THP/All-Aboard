"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import {
  LANDING_HERO_BODY_CLASS,
  LANDING_HERO_CONTAINER_CLASS,
  LANDING_HERO_COPY_CLASS,
  LANDING_HERO_COPY_TOP_CLASS,
  LANDING_HERO_DESCRIPTION_CLASS,
  LANDING_HERO_HEADING_CLASS,
  LANDING_HERO_PILLS_CLASS,
} from "./landing-layout";
import {
  Eyebrow,
  FeaturePill,
  GradientHeading,
} from "./legacy-ui";

type LandingPresentationBodyProps = {
  labels: LegacyLabels;
};

/** Marketing-only landing body — hero copy and feature pills, no auth CTAs or login card. */
export function LandingPresentationBody({ labels }: LandingPresentationBodyProps) {
  return (
    <div className={LANDING_HERO_BODY_CLASS} data-testid="landing-presentation-body">
      <div className={LANDING_HERO_CONTAINER_CLASS}>
        <div className={LANDING_HERO_COPY_CLASS}>
          <div className={LANDING_HERO_COPY_TOP_CLASS}>
            <Eyebrow variant="landing" className="mb-0">
              {labels.landing.eyebrow}
            </Eyebrow>
            <GradientHeading
              allowWrap
              landingHero
              className={LANDING_HERO_HEADING_CLASS}
              lead={labels.landing.headingLead}
              line2Prefix={labels.landing.headingLine2Prefix}
              accent={labels.landing.headingAccent}
              accentPrimary={labels.landing.headingAccentPrimary}
              accentSecondary={labels.landing.headingAccentSecondary}
            />
            <p className={LANDING_HERO_DESCRIPTION_CLASS}>
              {labels.landing.description}
            </p>
          </div>
          <div className={LANDING_HERO_PILLS_CLASS}>
            {labels.landing.pills.map((pill, index) => (
              <FeaturePill
                key={pill}
                label={pill}
                iconIndex={index as 0 | 1 | 2}
                size="lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
