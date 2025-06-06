import { and, eq, getTableColumns, getTableName } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

import { IBaseRepository } from "./IBaseRepository";
import { throwDbError } from "./utilities";
import { db } from "src/data/db";

export class BaseRepository<IEntity, IInsert, IUpdate> implements IBaseRepository<IEntity, IInsert, IUpdate> {
  protected clauses: { hasId: (id: string) => ReturnType<typeof eq>; active: ReturnType<typeof eq> };

  constructor(
    protected table: PgTable,
    public entityTypeName: string,
    protected userId?: string,
    protected defaultWith?: any,
    protected transform?: <T>(entities: any[]) => T,
  ) {
    const columns = getTableColumns(this.table);
    this.clauses = {
      hasId: (id: string) => eq(columns.id, id),
      active: eq(columns.active, true),
    };
  }

  async getQueryable(): Promise<any> {
    let queryable;

    const tableName: string = getTableName(this.table);

    if (Object.keys(db.query).includes(tableName)) {
      return db.query[tableName as keyof typeof db.query];
    } else {
      throwDbError(`Invalid db table name`);
    }
    return queryable;
  }

  async getAll(): Promise<IEntity[]> {
    try {
      const entities = (await this.getQueryable()).findMany({
        with: this.defaultWith,
        where: this.clauses.active,
      });

      return this.transform ? this.transform<IEntity[]>(entities) : entities;
    } catch (error) {
      return throwDbError(`Error getting ${this.entityTypeName}s`, error);
    }
  }

  async getById(id: string): Promise<IEntity | null> {
    try {
      const entity = (await this.getQueryable()).findFirst({
        with: this.defaultWith,
        where: and(this.clauses.hasId(id), this.clauses.active),
      });

      return this.transform ? this.transform<IEntity[]>([entity])[0] : entity;
    } catch (error) {
      return throwDbError(`Error getting  ${this.entityTypeName} by id`, error);
    }
  }

  async getByProperty(property: string, value: string): Promise<IEntity | null> {
    try {
      const columns = getTableColumns(this.table);

      if (!(property in columns)) {
        throw new Error(`Invalid property: '${property}' for table '${this.entityTypeName}'`);
      }

      const field = columns[property] as PgColumn;
      return (await this.getQueryable()).findFirst({
        with: this.defaultWith,
        where: and(eq(field, value), this.clauses.active),
      }) as IEntity | null;
    } catch (error) {
      return throwDbError(`Error getting ${this.entityTypeName} by ${property} with value ${value}`, error);
    }
  }

  async insert(payload: IInsert): Promise<IEntity | null> {
    try {
      const insertPayload = { ...payload, createdById: this.userId };
      const entities = await db.insert(this.table).values(insertPayload).returning();

      if (entities.length === 0) {
        throw new Error(`Could not insert ${this.entityTypeName}`);
      }
      return entities[0] as IEntity;
    } catch (error) {
      return throwDbError(`Error inserting ${this.entityTypeName}`, error);
    }
  }

  async update(payload: IUpdate): Promise<IEntity | null> {
    try {
      const updatePayload = { ...payload, updatedById: this.userId };
      const entities = await db
        .update(this.table)
        .set(updatePayload)
        .where(eq((this.table as any).id, (payload as any).id))
        .returning();

      if (entities.length === 0) {
        throw new Error(`Could not update ${this.entityTypeName} with id ${(payload as any).id}`);
      }
      return entities[0] as IEntity;
    } catch (error) {
      return throwDbError(`Error updating ${this.entityTypeName}`, error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await db
        .select()
        .from(this.table)
        .where(eq((this.table as any).id, id));
      if (existingEntity) {
        const entity = await this.update({
          id,
          deletedAt: new Date(),
          deletedById: this.userId,
          active: false,
        } as any);

        if (entity && !(entity as any).active) {
          return true; // soft deleted successfully
        }
      } else {
        const entities = await db
          .delete(this.table)
          .where(eq((this.table as any).id, id))
          .returning();

        if (entities.length > 0) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError(`Error deleting ${this.entityTypeName}`, error);
    }
  }
}
