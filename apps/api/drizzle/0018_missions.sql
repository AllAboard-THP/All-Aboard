-- #193 / ADR 0010: missions, applications and experience certifications.
DO $$ BEGIN
	CREATE TYPE "public"."mission_kind" AS ENUM('personal_project', 'freelance', 'hackathon');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."mission_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."mission_application_status" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"kind" "mission_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"github_repo_url" text,
	"compensation" text,
	"places" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"status" "mission_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "missions_places_positive" CHECK ("places" >= 1),
	CONSTRAINT "missions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "missions_status_created_idx" ON "missions" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "missions_author_created_idx" ON "missions" USING btree ("author_id","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mission_skills" (
	"mission_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "mission_skills_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "mission_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mission_skills_mission_skill_unique" ON "mission_skills" USING btree ("mission_id","skill_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mission_skills_skill_idx" ON "mission_skills" USING btree ("skill_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mission_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"applicant_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "mission_application_status" DEFAULT 'pending' NOT NULL,
	"deliverable_url" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mission_applications_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "mission_applications_applicant_id_users_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "mission_applications_mission_applicant_unique" ON "mission_applications" USING btree ("mission_id","applicant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mission_applications_applicant_idx" ON "mission_applications" USING btree ("applicant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experience_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"attester_id" uuid NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"claim_triple_id" text,
	"attestation_triple_id" text,
	"tx_hash" text,
	"published_at" timestamp with time zone,
	"publish_error" text,
	"publish_attempts" integer DEFAULT 0 NOT NULL,
	"next_publish_at" timestamp with time zone,
	CONSTRAINT "experience_certifications_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "experience_certifications_not_self" CHECK ("recipient_id" <> "attester_id"),
	CONSTRAINT "experience_certifications_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "experience_certifications_application_id_mission_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."mission_applications"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "experience_certifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "experience_certifications_attester_id_users_id_fk" FOREIGN KEY ("attester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "experience_certifications_mission_recipient_unique" ON "experience_certifications" USING btree ("mission_id","recipient_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "experience_certifications_recipient_revoked_idx" ON "experience_certifications" USING btree ("recipient_id","revoked_at");
