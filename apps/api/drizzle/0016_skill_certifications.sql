CREATE TABLE IF NOT EXISTS "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"intuition_atom_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"attester_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"claim_triple_id" text,
	"attestation_triple_id" text,
	"tx_hash" text,
	"published_at" timestamp with time zone,
	"publish_error" text,
	"publish_attempts" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "certifications_not_self" CHECK ("recipient_id" <> "attester_id"),
	CONSTRAINT "certifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "certifications_attester_id_users_id_fk" FOREIGN KEY ("attester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "certifications_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "certifications_recipient_attester_skill_unique" ON "certifications" USING btree ("recipient_id","attester_id","skill_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_recipient_revoked_idx" ON "certifications" USING btree ("recipient_id","revoked_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certifications_attester_created_idx" ON "certifications" USING btree ("attester_id","created_at");
