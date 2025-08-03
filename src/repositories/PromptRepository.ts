import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { Prompt, PromptDatabase } from '@/types/Prompt.js';
import { SelectPromptSchema } from '@/types/validators/Prompt.js';
import { Connect } from '@/utils/connection/Connect.js';
import { LogDomain, logger } from '@/utils/logger.js';

const turso = Connect.toTursoDatabase();

interface PromptRepositoryOptions {
  userId: string;
  projectId: string;
  promptId: string;
}

class PromptRepository {
  // ------------------------------------------
  // -------------- GENERIC CRUD --------------
  // ------------------------------------------

  /**
   * Save a prompt in the database.
   *
   * @param {Omit<PromptDatabase, 'id'>} prompt - The prompt to be saved.
   * @param {Omit<PromptRepositoryOptions, 'projectId'>} options - The options
   * to filter the prompt:
   *  - userId: The user unique identifier.
   * @returns {Promise<Prompt>} A promise containing the saved prompt.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async create(
    prompt: Omit<PromptDatabase, 'id'>,
    { userId }: Omit<PromptRepositoryOptions, 'promptId' | 'projectId'>
  ): Promise<Prompt> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Creating prompt', {
      prompt: prompt,
      userId: userId,
    });
    const uuid = uuidv4();
    const query = {
      sql:
        'INSERT INTO prompt ' +
        '(id, name, prompt, description, active, createdAt, updatedAt, projectId) ' +
        'SELECT :id, :name, :prompt, :description, :active, :createdAt, :updatedAt, ' +
        'p.id FROM (SELECT id FROM project WHERE id = :projectId ' +
        'AND userId = :userId) AS p ' +
        'RETURNING *;',
      args: { id: uuid, userId: userId, ...prompt },
    };
    logger.debug([LogDomain.REPOSITORY], 'Creating prompt query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      // @ts-expect-error code is contained on turso errors
      if (err.code === 'SQLITE_CONSTRAINT') {
        logger.error([LogDomain.REPOSITORY], 'Unique constraint error', {
          error: err,
          prompt: prompt,
          userId: userId,
        });
        throw new DatabaseError(
          'Unique Constraint Error',
          'The house already exists in the database.',
          err
        );
      } else {
        logger.error([LogDomain.REPOSITORY], 'Unknown error when creating prompt', {
          error: err,
          prompt: prompt,
          userId: userId,
        });
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when creating prompt', {
        prompt: prompt,
        userId: userId,
      });
      throw new DatabaseError(
        'No Result Error',
        'No result was found in the database.'
      );
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Prompt operation completed successfully', {
      operation: 'create',
    });
    return result;
  }

  /**
   * Read a prompt from the database.
   *
   * @param {PromptRepositoryOptions} options - The options to filter the prompt:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   *  - promptId: The prompt unique identifier.
   * @returns {Promise<Prompt>} A promise containing the prompt.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readOne({
    projectId,
    userId,
    promptId,
  }: PromptRepositoryOptions): Promise<Prompt> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Querying prompt', {
      promptId: promptId,
      userId: userId,
      projectId: projectId,
    });
    const query = {
      sql:
        'SELECT * FROM prompt JOIN project ON prompt.projectId = project.id ' +
        'WHERE prompt.id = :promptId AND project.userId = :userId ' +
        'AND prompt.projectId = :projectId;',
      args: { promptId: promptId, projectId: projectId, userId: userId },
    };
    logger.debug([LogDomain.REPOSITORY], 'Reading prompt query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading prompt', {
        error: err,
        promptId: promptId,
        userId: userId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when reading prompt', {
        promptId: promptId,
        userId: userId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Prompt operation completed successfully', {
      result: result,
      operation: 'readOne',
    });
    return result;
  }

  /**
   * Read all prompts from the database.
   *
   * @param {Omit<PromptRepositoryOptions, 'promptId'>} options - The options
   * to filter the prompts:
   *  - userId: The user unique identifier.
   *  - projectId: The project unique identifier.
   * @returns {Promise<Prompt[] | []>} A promise containing the list of all prompts.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readAll({
    userId,
    projectId,
  }: Omit<PromptRepositoryOptions, 'promptId'>): Promise<Prompt[] | []> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Reading all prompts', {
      projectId: projectId,
      userId: userId,
    });
    const query = {
      sql:
        'SELECT * FROM prompt JOIN project ON prompt.projectId = project.id ' +
        'WHERE project.userId = :userId AND prompt.projectId = :projectId;',
      args: { projectId: projectId, userId: userId },
    };
    logger.debug([LogDomain.REPOSITORY], 'Reading all prompts query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading prompts', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.info([LogDomain.REPOSITORY], 'No prompts found', {
        projectId: projectId,
        userId: userId,
      });
      return [];
    }
    const result = response.rows.map((r) => SelectPromptSchema.parse(r));
    logger.info([LogDomain.REPOSITORY], 'Prompt operation completed successfully', {
      operation: 'readAll',
    });
    return result;
  }

  /**
   * Update a given prompt in the database.
   *
   * @params {PromptRepositoryOptions & { changes: Partial<Prompt>}} options -
   * The options to filter the prompt:
   *  - promptId: The prompt unique identifier.
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   *  - changes: The changes to apply on the prompt.
   * @returns {Promise<Prompt>} A promise containing the updated prompt.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update({
    promptId,
    projectId,
    userId,
    changes,
  }: PromptRepositoryOptions & { changes: Partial<PromptDatabase> }): Promise<Prompt> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Updating prompt', {
      promptId: promptId,
      projectId: projectId,
    });
    const keys = Object.keys(changes) as Array<keyof PromptDatabase>;

    if (keys.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No changes were provided');
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE prompt SET ${setClause} WHERE id = ? RETURNING *;`,
      args: [...values, promptId],
    };
    logger.debug([LogDomain.REPOSITORY], 'Updating prompt query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when updating prompt', {
        error: err,
        promptId: promptId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when updating prompt', {
        promptId: promptId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Prompt operation completed successfully', {
      operation: 'update',
    });
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
  public static async delete({
    promptId,
    projectId,
  }: PromptRepositoryOptions): Promise<true> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Deleting prompt', {
      promptId: promptId,
      projectId: projectId,
    });
    const query = {
      sql: 'DELETE FROM prompt WHERE id = ? AND projectId = ?;',
      args: [promptId, projectId],
    };
    logger.debug([LogDomain.REPOSITORY], 'Deleting prompt query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when deleting prompt', {
        error: err,
        promptId: promptId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rowsAffected === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when deleting prompt', {
        promptId: promptId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    logger.info([LogDomain.REPOSITORY], 'Prompt operation completed successfully', {
      operation: 'delete',
    });
    return true;
  }

  // ------------------------------------
  // -------------- CUSTOM --------------
  // ------------------------------------

  /**
   * Read the current active prompt in the database.
   *
   * @param {Omit<PromptRepositoryOptions, 'promptId'>} options - The options
   * to filter the prompt:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   * @returns {Promise<Prompt>} A promise containing the current active prompt
   * in the database.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readActive({
    projectId,
    userId,
  }: Omit<PromptRepositoryOptions, 'promptId'>): Promise<Prompt> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Reading active prompt', {
      projectId: projectId,
      userId: userId,
    });
    const query = {
      sql:
        'SELECT * FROM prompt JOIN project ON prompt.projectId = project.id ' +
        'WHERE active = true AND prompt.projectId = :projectId AND ' +
        'project.userId = :userId;',
      args: { projectId: projectId, userId: userId },
    };
    logger.debug([LogDomain.REPOSITORY], 'Reading active prompt query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading active prompt', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when reading active prompt', {
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectPromptSchema.parse(response.rows[0]);
    logger.info(
      [LogDomain.REPOSITORY],
      'Active prompt operation completed successfully',
      {
        operation: 'readActive',
      }
    );
    return result;
  }
}

export { PromptRepository };
