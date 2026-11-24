-- #197: timestamped annotations on video messages, their replies, and read markers.
CREATE TABLE IF NOT EXISTS "message_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"at_ms" integer NOT NULL,
	"rect_x" double precision,
	"rect_y" double precision,
	"rect_w" double precision,
	"rect_h" double precision,
	"body" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_annotations_at_ms_non_negative" CHECK ("at_ms" >= 0),
	CONSTRAINT "message_annotations_rect_valid" CHECK (
		("rect_x" IS NULL AND "rect_y" IS NULL AND "rect_w" IS NULL AND "rect_h" IS NULL)
		OR ("rect_x" >= 0 AND "rect_y" >= 0 AND "rect_w" > 0 AND "rect_h" > 0
			AND "rect_x" + "rect_w" <= 1 AND "rect_y" + "rect_h" <= 1)
	),
	CONSTRAINT "message_annotations_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "message_annotations_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "message_annotations_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_annotations_message_at_idx" ON "message_annotations" USING btree ("message_id","at_ms");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_annotation_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"annotation_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_annotation_replies_annotation_id_message_annotations_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "public"."message_annotations"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "message_annotation_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_annotation_replies_annotation_created_idx" ON "message_annotation_replies" USING btree ("annotation_id","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_annotation_reads" (
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp with time zone NOT NULL,
	CONSTRAINT "message_annotation_reads_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "message_annotation_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "message_annotation_reads_message_user_unique" ON "message_annotation_reads" USING btree ("message_id","user_id");
