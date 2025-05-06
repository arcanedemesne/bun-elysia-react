CREATE TABLE "bun_elysia_react"."teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true,
	CONSTRAINT "teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255),
	"team_id" uuid,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(25) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."users_to_teams" (
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "users_to_teams_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
);
--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."teams" ADD CONSTRAINT "teams_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."teams" ADD CONSTRAINT "teams_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "bun_elysia_react"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bun_elysia_react"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "bun_elysia_react"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "bun_elysia_react"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teams_name_index" ON "bun_elysia_react"."teams" USING btree ("name");--> statement-breakpoint
CREATE INDEX "todos_team_id_index" ON "bun_elysia_react"."todos" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "users_username_index" ON "bun_elysia_react"."users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_email_index" ON "bun_elysia_react"."users" USING btree ("email");