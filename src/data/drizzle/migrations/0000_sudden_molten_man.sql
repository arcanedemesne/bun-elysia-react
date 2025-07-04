CREATE TABLE "bun_elysia_react"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(25) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"session_id" uuid,
	"refresh_token" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true,
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."users_to_organizations" (
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	CONSTRAINT "users_to_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true,
	CONSTRAINT "teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."users_to_teams" (
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	CONSTRAINT "users_to_teams_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" varchar(255) NOT NULL,
	"message" varchar(255) NOT NULL,
	"organization_id" uuid,
	"team_id" uuid,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."users_to_messages" (
	"user_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"is_read" boolean DEFAULT false,
	CONSTRAINT "users_to_messages_user_id_message_id_pk" PRIMARY KEY("user_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "bun_elysia_react"."todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255),
	"organization_id" uuid,
	"team_id" uuid,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"deleted_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT null,
	"deleted_at" timestamp,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_organizations" ADD CONSTRAINT "users_to_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bun_elysia_react"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_organizations" ADD CONSTRAINT "users_to_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "bun_elysia_react"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "bun_elysia_react"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bun_elysia_react"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_teams" ADD CONSTRAINT "users_to_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "bun_elysia_react"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."messages" ADD CONSTRAINT "messages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "bun_elysia_react"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."messages" ADD CONSTRAINT "messages_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "bun_elysia_react"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_messages" ADD CONSTRAINT "users_to_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bun_elysia_react"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."users_to_messages" ADD CONSTRAINT "users_to_messages_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "bun_elysia_react"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "bun_elysia_react"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bun_elysia_react"."todos" ADD CONSTRAINT "todos_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "bun_elysia_react"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_username_index" ON "bun_elysia_react"."users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_email_index" ON "bun_elysia_react"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_index" ON "bun_elysia_react"."users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_created_by_id_index" ON "bun_elysia_react"."users" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "users_active_index" ON "bun_elysia_react"."users" USING btree ("active");--> statement-breakpoint
CREATE INDEX "organizations_name_index" ON "bun_elysia_react"."organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "organizations_created_at_index" ON "bun_elysia_react"."organizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organizations_created_by_id_index" ON "bun_elysia_react"."organizations" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "organizations_active_index" ON "bun_elysia_react"."organizations" USING btree ("active");--> statement-breakpoint
CREATE INDEX "users_to_organizations_organization_id_index" ON "bun_elysia_react"."users_to_organizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_user_id_index" ON "bun_elysia_react"."users_to_organizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_to_organizations_created_at_index" ON "bun_elysia_react"."users_to_organizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_to_organizations_created_by_id_index" ON "bun_elysia_react"."users_to_organizations" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "teams_name_index" ON "bun_elysia_react"."teams" USING btree ("name");--> statement-breakpoint
CREATE INDEX "teams_created_at_index" ON "bun_elysia_react"."teams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "teams_created_by_id_index" ON "bun_elysia_react"."teams" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "teams_active_index" ON "bun_elysia_react"."teams" USING btree ("active");--> statement-breakpoint
CREATE INDEX "users_to_teams_team_id_index" ON "bun_elysia_react"."users_to_teams" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "users_to_teams_user_id_index" ON "bun_elysia_react"."users_to_teams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_to_teams_created_at_index" ON "bun_elysia_react"."users_to_teams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_to_teams_created_by_id_index" ON "bun_elysia_react"."users_to_teams" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_index" ON "bun_elysia_react"."messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_organization_id_index" ON "bun_elysia_react"."messages" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "messages_team_id_index" ON "bun_elysia_react"."messages" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "messages_created_by_id_index" ON "bun_elysia_react"."messages" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "messages_active_index" ON "bun_elysia_react"."messages" USING btree ("active");--> statement-breakpoint
CREATE INDEX "users_to_messages_user_id_index" ON "bun_elysia_react"."users_to_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_to_messages_message_id_index" ON "bun_elysia_react"."users_to_messages" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "todos_organization_id_index" ON "bun_elysia_react"."todos" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "todos_team_id_index" ON "bun_elysia_react"."todos" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "todos_created_at_index" ON "bun_elysia_react"."todos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "todos_created_by_id_index" ON "bun_elysia_react"."todos" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "todos_active_index" ON "bun_elysia_react"."todos" USING btree ("active");