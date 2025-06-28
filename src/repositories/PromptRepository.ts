import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { Prompt, PromptDatabase } from '@/types/Prompt.js';
import { SelectPromptSchema } from '@/types/validators/Prompt.js';
import { Connect } from '@/utils/connection/Connect.js';

const turso = Connect.toTursoDatabase();

class PromptRepository {
  /**
  * Save a prompt in the database.
  *
  * @param {Omit<PromptDatabase, 'id'>} prompt - The prompt to be saved.
  * @returns {Promise<Prompt>} A promise containing the saved prompt.
  * @throws {DatabaseError} When an error occurred with the database.
  */
  public static async create(prompt: Omit<PromptDatabase, 'id'>): Promise<Prompt> {
    let response: ResultSet;
    const uuid = uuidv4();
    const query = {
      sql: 'INSERT INTO prompt '
        + '(id, name, prompt, description) '
        + 'VALUES (?, ?, ?, ?) RETURNING *;',
      args: [uuid, ...Object.values(prompt)],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      // @ts-expect-error code is contained on turso errors
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new DatabaseError(
          'Unique Constraint Error',
          'The house already exists in the database.',
          err,
        );
      } else {
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      throw new DatabaseError(
        'No Result Error',
        'No result was found in the database.',
      );
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Read a prompt or all prompts from the database.
   *
   * @param {string | undefined} id - The prompt unique identifier.
   * @returns {Promise<Prompt | Prompt[]>} A promise containing the prompt
   * selected (if a unique identifier was provided as a parameter). Otherwise,
   * returns a promise containing the list of all prompts.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async read(id?: string): Promise<Prompt | Prompt[]> {
    let response: ResultSet;
    if (id) {
      const query = {
        sql: 'SELECT * FROM prompt WHERE id = ?;',
        args: [id],
      };
      try {
        response = await turso.execute(query);
      } catch (err) {
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    } else {
      const query = {
        sql: 'SELECT * FROM prompt;',
      };
      try {
        response = await turso.execute(query);
      } catch (err) {
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      throw new DatabaseError(
        'No Result Error',
        'No result was found in the database.',
      );
    } else {
      if (id) {
        const result = SelectPromptSchema.parse(response.rows[0]);
        return result;
      } else {
        const result = response.rows.map((r) => SelectPromptSchema.parse(r));
        return result;
      }
    }
  }

  /**
   * Update a given prompt in the database.
   *
   * @param {string} id - The prompt unique identifier.
   * @param {Partial<PromptDatabase>} changes - The changes to apply on the prompt.
   * @returns {Promise<Omit<Prompt, 'id'>>} A promise containing the updated
   * prompt.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update(
    id: string,
    changes: Partial<PromptDatabase>,
  ): Promise<Omit<Prompt, 'id'>> {
    let response: ResultSet;
    const keys = Object.keys(changes) as Array<keyof PromptDatabase>;

    if (keys.length === 0) {
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE prompt SET ${setClause} WHERE id = ? RETURNING *;`,
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
    const result = SelectPromptSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Delete a given prompt in the database.
   *
   * @param {string} id - The prompt unique identifier.
   * @returns {Promise<true>} Returns `true` if the prompt was deleted
   * successfully.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async delete(id: string): Promise<true> {
    let response: ResultSet;
    const query = {
      sql: 'DELETE FROM prompt WHERE id = ?;',
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

  /**
  * Read the current active prompt in the database.
  *
  * @returns {Promise<Prompt>} A promise containing the current active prompt
  * in the database.
  * @throws {DatabaseError} When an error occurred with the database.
  */
  public static async readActive(): Promise<Prompt> {
    let response: ResultSet;
    const query = {
      sql: 'SELECT * FROM prompt WHERE active = true;',
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    return result;
  }
}

export { PromptRepository };
