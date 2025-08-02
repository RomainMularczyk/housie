import { DatabaseError } from '@/errors/DatabaseError.js';
import { Project } from '@/types/Project.js';
import { SelectProjectSchema } from '@/types/validators/Project.js';
import { Connect } from '@/utils/connection/Connect.js';
import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

const turso = Connect.toTursoDatabase();

class ProjectRepository {
  // --------------------------------------------
  // -------------- GENERIC CRUD  --------------
  // --------------------------------------------

  /**
   * Save a project in the database.
   *
   * @param {Omit<Project, 'id'>} project - The project to be saved.
   * @returns {Promise<Project>} A promise containing the saved project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async create(project: Omit<Project, 'id'>): Promise<Project> {
    let response: ResultSet;
    const uuid = uuidv4();
    const query = {
      sql:
        'INSERT INTO project' +
        '(id, name, userId)' +
        'VALUES (:id, :name, :userId)' +
        'RETURNING *;',
      args: { id: uuid, ...project },
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      // @ts-expect-error code is contained on turso errors
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new DatabaseError(
          'Unique Constraint Error',
          'The house already exists in the database.',
          err
        );
      } else {
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Read a project in the database.
   *
   * @param {string} id - The project unique identifier.
   * @returns {Promise<Project>} A promise containing the project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readOne(id: string): Promise<Project> {
    let response: ResultSet;
    const query = {
      sql: 'SELECT * FROM project WHERE id = ?;',
      args: [id],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Read all projects in the database.
   *
   * @returns {Promise<Project[]>} A promise containing the list of all projects.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readAll(): Promise<Project[] | []> {
    let response: ResultSet;
    const query = {
      sql: 'SELECT * FROM project;',
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      return [];
    }
    const result = response.rows.map((r) => SelectProjectSchema.parse(r));
    return result;
  }

  /**
   * Update a given project in the database.
   *
   * @param {string} id - The project unique identifier.
   * @param {Partial<Project>} changes - The changes to apply on the project.
   * @returns {Promise<Project>} A promise containing the updated project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update(id: string, changes: Partial<Project>): Promise<Project> {
    let response: ResultSet;
    const keys = Object.keys(changes) as Array<keyof Project>;

    if (keys.length === 0) {
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE project SET ${setClause} WHERE id = ? RETURNING *;`,
      args: [...values, id],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Delete a given project in the database.
   *
   * @param {string} id - The project unique identifier.
   * @returns {Promise<true>} Return `true` if the project was deleted
   * successfully.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async delete(id: string): Promise<true> {
    let response: ResultSet;
    const query = {
      sql: 'DELETE FROM project WHERE id = ?;',
      args: [id],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rowsAffected === 0) {
      throw new DatabaseError('No Result Error', undefined);
    }
    return true;
  }
}

export { ProjectRepository };
