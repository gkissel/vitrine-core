import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260524000000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "whatsapp_config" ("id" text not null, "whatsapp_number" text not null, "message_template" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "whatsapp_config_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_whatsapp_config_deleted_at" ON "whatsapp_config" ("deleted_at") WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "whatsapp_config" cascade;`);
	}
}
