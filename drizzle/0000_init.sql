CREATE TYPE "public"."invitation_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'audio');--> statement-breakpoint
CREATE TYPE "public"."rsvp_attending" AS ENUM('yes', 'no', 'maybe');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('wedding', 'birthday', 'graduation', 'baby_shower', 'anniversary', 'corporate', 'other');--> statement-breakpoint
CREATE TABLE "geocode_cache" (
	"query_hash" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug_token" text NOT NULL,
	"group" text,
	CONSTRAINT "guests_slug_token_unique" UNIQUE("slug_token")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"template_id" text NOT NULL,
	"slug" text,
	"status" "invitation_status" DEFAULT 'draft' NOT NULL,
	"draft_config" jsonb NOT NULL,
	"published_config" jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "invitations_slug_format" CHECK ("invitations"."slug" IS NULL OR "invitations"."slug" ~ '^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$'),
	CONSTRAINT "invitations_published_has_config" CHECK ("invitations"."status" <> 'published' OR ("invitations"."published_config" IS NOT NULL AND "invitations"."slug" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"invitation_id" uuid,
	"kind" "media_kind" NOT NULL,
	"key" text NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration_sec" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_key_unique" UNIQUE("key"),
	CONSTRAINT "media_assets_bytes_positive" CHECK ("media_assets"."bytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"invitation_id" uuid NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "page_views_invitation_id_day_pk" PRIMARY KEY("invitation_id","day")
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"guest_name" text NOT NULL,
	"attending" "rsvp_attending" NOT NULL,
	"party_size" integer DEFAULT 1 NOT NULL,
	"message" text,
	"contact" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent_hash" text NOT NULL,
	CONSTRAINT "rsvps_party_size_range" CHECK ("rsvps"."party_size" BETWEEN 0 AND 20)
);
--> statement-breakpoint
CREATE TABLE "templates_meta" (
	"id" text PRIMARY KEY NOT NULL,
	"category" "template_category" NOT NULL,
	"name" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"message" text NOT NULL,
	"approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_template_id_templates_meta_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates_meta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guests_invitation_idx" ON "guests" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "invitations_owner_idx" ON "invitations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "media_assets_owner_idx" ON "media_assets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "media_assets_invitation_idx" ON "media_assets" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "rsvps_invitation_idx" ON "rsvps" USING btree ("invitation_id","created_at");--> statement-breakpoint
CREATE INDEX "wishes_invitation_idx" ON "wishes" USING btree ("invitation_id","created_at");