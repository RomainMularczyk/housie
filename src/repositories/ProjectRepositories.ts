import { DatabaseError } from '@/errors/DatabaseError.js';
import { Project } from '@/types/Project.js';
import { SelectProjectSchema } from '@/types/validators/Project.js';
import { Connect } from '@/utils/connection/Connect.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

const turso = Connect.toTursoDatabase();

interface ProjectRepositoryOptions {
  userId: string;
  projectId: string;
}

class ProjectRepository {
  // ------------------------------------------
  // -------------- GENERIC CRUD --------------
  // ------------------------------------------

  /**
   * Save a project in the database.
   *
   * @param {Omit<Project, 'id'>} project - The project to be saved.
   * @returns {Promise<Project>} A promise containing the saved project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async create(project: Omit<Project, 'id'>): Promise<Project> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Creating project', { project: project });
    const uuid = uuidv4();
    const query = {
      sql:
        'INSERT INTO project' +
        '(id, name, userId, createdAt, updatedAt)' +
        'VALUES (:id, :name, :userId, :createdAt, :updatedAt)' +
        'RETURNING *;',
      args: { id: uuid, ...project },
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      // @ts-expect-error code is contained on turso errors
      if (err.code === 'SQLITE_CONSTRAINT') {
        logger.error([LogDomain.REPOSITORY], 'Unique constraint error', {
          error: err,
          project: project,
        });
        throw new DatabaseError(
          'Unique Constraint Error',
          'The house already exists in the database.',
          err
        );
      } else {
        logger.error([LogDomain.REPOSITORY], 'Unknown error when creating project', {
          error: err,
          project: project,
        });
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when creating project', {
        project: project,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Project operation completed successfully', {
      operation: 'create',
    });
    return result;
  }

  /**
   * Read a project in the database.
   *
   * @param {ProjectRepositoryOptions} options - The options to filter the project:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   * @returns {Promise<Project>} A promise containing the project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readOne({
    projectId,
    userId,
  }: ProjectRepositoryOptions): Promise<Project> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Querying project', {
      projectId: projectId,
      userId: userId,
    });
    const query = {
      sql: 'SELECT * FROM project WHERE id = ? AND userId = ?;',
      args: [projectId, userId],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading project', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when reading project', {
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Project operation completed successfully', {
      result: result,
      operation: 'readOne',
    });
    return result;
  }

  /**
   * Read all projects in the database.
   *
   * @param {Omit<ProjectRepositoryOptions, 'projectId'>} options - The options
   * to filter the projects:
   *  - userId: The user unique identifier.
   * @returns {Promise<Project[]>} A promise containing the list of all projects.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readAll({
    userId,
  }: Omit<ProjectRepositoryOptions, 'projectId'>): Promise<Project[] | []> {
    let response: ResultSet;
    logger.info(
      [LogDomain.REPOSITORY],
      `Querying all projects with user ID: ${userId}`
    );
    const query = {
      sql: 'SELECT * FROM project WHERE userId = ?;',
      args: [userId],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknwon error when reading projects', {
        error: err,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.info([LogDomain.REPOSITORY], 'No projects found', {
        userId: userId,
      });
      return [];
    }
    const result = response.rows.map((r) => SelectProjectSchema.parse(r));
    logger.info([LogDomain.REPOSITORY], 'Project operation completed successfully', {
      userId: userId,
      operation: 'readAll',
    });
    return result;
  }

  /**
   * Update a given project in the database.
   *
   * @param {ProjectRepositoryOptions & Partial<Project>} options - The options to
   * filter the project:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   *  - changes: The changes to apply on the project.
   * @returns {Promise<Project>} A promise containing the updated project.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update({
    projectId,
    userId,
    changes,
  }: ProjectRepositoryOptions & { changes: Partial<Project> }): Promise<Project> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Updating project', {
      projectId: projectId,
      userId: userId,
    });
    const keys = Object.keys(changes) as Array<keyof Project>;

    if (keys.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No changes were provided');
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE project SET ${setClause} WHERE id = ? AND userId = ? RETURNING *;`,
      args: [...values, projectId, userId],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when updating project', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when updating project', {
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectProjectSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'Project operation completed successfully', {
      projectId: projectId,
      userId: userId,
      operation: 'update',
    });
    return result;
  }

  /**
   * Delete a given project in the database.
   *
   * @param {ProjectRepositoryOptions} options - The options to filter the project:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   * @returns {Promise<true>} Return `true` if the project was deleted
   * successfully.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async delete({
    projectId,
    userId,
  }: ProjectRepositoryOptions): Promise<true> {
    let response: ResultSet;
    logger.info(
      [LogDomain.REPOSITORY],
      `Deleting project with ID: ${projectId} and user ID: ${userId}`
    );
    const query = {
      sql: 'DELETE FROM project WHERE id = ? AND userId = ?;',
      args: [projectId, userId],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when deleting project', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rowsAffected === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when deleting project', {
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    logger.info([LogDomain.REPOSITORY], 'Project operation completed successfully', {
      projectId: projectId,
      userId: userId,
      operation: 'delete',
    });
    return true;
  }
}

export { ProjectRepository };
