import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { Connect } from '@/utils/connection/Connect.js';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { House, HouseDatabase } from '@/types/House.js';
import { SelectHouseSchema } from '@/types/validators/House.js';
import { LogDomain, logger } from '@/utils/logger.js';

const turso = Connect.toTursoDatabase();

interface HouseRepositoryOptions {
  userId: string;
  projectId: string;
  houseId: string;
}

class HouseRepository {
  // ------------------------------------------
  // -------------- GENERIC CRUD --------------
  // ------------------------------------------

  /**
   * Save a house in the database.
   *
   * @param {Omit<HouseDatabase, 'id'>} house - The house to be saved.
   * @param {Omit<HouseRepositoryOptions, 'houseId'>} options -
   * The options to filter the house:
   *  - userId: The user unique identifier.
   * @returns {Promise<House>} A promise containing the saved house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async create(
    house: Omit<HouseDatabase, 'id'>,
    { userId }: Omit<HouseRepositoryOptions, 'houseId' | 'projectId'>
  ): Promise<House> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Creating house', {
      house: house,
      userId: userId,
    });
    const uuid = uuidv4();
    const query = {
      sql:
        'INSERT INTO house ' +
        '(id, name, description, price, size, rooms, dpe, url, city, postCode, ' +
        'isArchived, isFavorite, isUserPicked, isHousiaPicked, projectId, ' +
        'createdAt, updatedAt) ' +
        'SELECT :id, :name, :description, :price, :size, :rooms, :dpe, ' +
        ':url, :city, :postCode, :isArchived, :isFavorite, :isUserPicked, ' +
        ':isHousiaPicked, p.id, :createdAt, :updatedAt ' +
        'FROM (SELECT id FROM project WHERE id = :projectId ' +
        'AND userId = :userId) AS p ' +
        'RETURNING *;',
      args: { id: uuid, userId: userId, ...house },
    };
    logger.debug([LogDomain.REPOSITORY], 'Creating house query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      // @ts-expect-error code is contained on turso errors
      if (err.code === 'SQLITE_CONSTRAINT') {
        logger.error([LogDomain.REPOSITORY], 'Unique constraint error', {
          error: err,
          house: house,
          userId: userId,
        });
        throw new DatabaseError(
          'Unique Constraint Error',
          'The house already exists in the database.',
          err
        );
      } else {
        logger.error([LogDomain.REPOSITORY], 'Unknown error when creating house', {
          error: err,
          house: house,
          userId: userId,
        });
        throw new DatabaseError('Unknown Error', undefined, err);
      }
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when creating house', {
        house: house,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectHouseSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'House operation completed successfully', {
      operation: 'create',
    });
    return result;
  }

  /**
   * Read a house in the database.
   *
   * @param {HouseRepositoryOptions} options - The options to filter the house:
   *  - projectId: The project unique identifier.
   *  - userId: The user unique identifier.
   *  - houseId: The house unique identifier.
   * @returns {Promise<House>} A promise containing the house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readOne({
    projectId,
    userId,
    houseId,
  }: HouseRepositoryOptions): Promise<House> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Querying house', {
      houseId: houseId,
      userId: userId,
      projectId: projectId,
    });
    const query = {
      sql:
        'SELECT * FROM house JOIN project ON house.projectId = project.id ' +
        'WHERE house.id = :houseId AND project.userId = :userId ' +
        'AND house.projectId = :projectId;',
      args: { houseId: houseId, userId: userId, projectId: projectId },
    };
    logger.debug([LogDomain.REPOSITORY], 'Reading house query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading house', {
        error: err,
        houseId: houseId,
        userId: userId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when reading house', {
        houseId: houseId,
        userId: userId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectHouseSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'House operation completed successfully', {
      operation: 'readOne',
    });
    return result;
  }

  /**
   * Read all houses in the database.
   *
   * @param {Omit<HouseRepositoryOptions, 'houseId'>} options - The options
   * to filter the houses:
   *  - userId: The user unique identifier.
   *  - projectId: The project unique identifier.
   * @returns {Promise<House[] | []>} A promise containing the list of all houses.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readAll({
    userId,
    projectId,
  }: Omit<HouseRepositoryOptions, 'houseId'>): Promise<House[] | []> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Reading all houses', {
      projectId: projectId,
      userId: userId,
    });
    const query = {
      sql:
        'SELECT * FROM house JOIN project ON house.projectId = project.id ' +
        'WHERE house.projectId = :projectId AND project.userId = :userId;',
      args: { projectId: projectId, userId: userId },
    };
    logger.debug([LogDomain.REPOSITORY], 'Reading all houses query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when reading houses', {
        error: err,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.info([LogDomain.REPOSITORY], 'No houses found', {
        projectId: projectId,
        userId: userId,
      });
      return [];
    }
    const result = response.rows.map((r) => SelectHouseSchema.parse(r));
    logger.info([LogDomain.REPOSITORY], 'House operation completed successfully', {
      operation: 'readAll',
    });
    return result;
  }

  /**
   * Update a given house in the database.
   *
   * @param {HouseRepositoryOptions & Partial<HouseDatabase>} options - The options
   * to filter the house:
   *  - houseId: The house unique identifier.
   *  - projectId: The project unique identifier.
   *  - changes: The changes to apply on the house.
   * @returns {Promise<House>} A promise containing the updated house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update({
    houseId,
    projectId,
    changes,
  }: HouseRepositoryOptions & { changes: Partial<HouseDatabase> }): Promise<House> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Updating house', {
      houseId: houseId,
      projectId: projectId,
    });
    const keys = Object.keys(changes) as Array<keyof HouseDatabase>;

    if (keys.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No changes were provided');
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE house SET ${setClause} WHERE id = ? RETURNING *;`,
      args: [...values, houseId],
    };
    logger.debug([LogDomain.REPOSITORY], 'Updating house query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when updating house', {
        error: err,
        houseId: houseId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when updating house', {
        houseId: houseId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectHouseSchema.parse(response.rows[0]);
    logger.info([LogDomain.REPOSITORY], 'House operation completed successfully', {
      operation: 'update',
    });
    return result;
  }

  /**
   * Delete a given house in the database.
   *
   * @param {HouseRepositoryOptions} options - The options to filter the house:
   *  - houseId: The house unique identifier.
   *  - projectId: The project unique identifier.
   * @returns {Promise<true>} Return `true` if the house was deleted
   * successfully.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async delete({
    houseId,
    projectId,
  }: HouseRepositoryOptions): Promise<true> {
    let response: ResultSet;
    logger.info([LogDomain.REPOSITORY], 'Deleting house', {
      houseId: houseId,
      projectId: projectId,
    });
    const query = {
      sql: 'DELETE FROM house WHERE id = ? AND projectId = ?;',
      args: [houseId, projectId],
    };
    logger.debug([LogDomain.REPOSITORY], 'Deleting house query', {
      query: query,
    });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.REPOSITORY], 'Unknown error when deleting house', {
        error: err,
        houseId: houseId,
        projectId: projectId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rowsAffected === 0) {
      logger.error([LogDomain.REPOSITORY], 'No result when deleting house', {
        houseId: houseId,
        projectId: projectId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    logger.info([LogDomain.REPOSITORY], 'House operation completed successfully', {
      operation: 'delete',
    });
    return true;
  }

  // ------------------------------------
  // -------------- CUSTOM --------------
  // ------------------------------------

  /**
   * Find a house by a given key and search query.
   *
   * @param {HouseRepositoryOptions & { key: string; searchQuery: string }} options -
   * The options to filter the house:
   *  - houseId: The house unique identifier.
   *  - projectId: The project unique identifier.
   *  - key: The key to search.
   *  - searchQuery: The search query.
   * @returns {Promise<House>} A promise containing the found house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async findOneBy({
    projectId,
    userId,
    key,
    searchQuery,
  }: Omit<HouseRepositoryOptions, 'houseId'> & {
    key: string;
    searchQuery: string;
  }): Promise<House | undefined> {
    let response: ResultSet;
    logger.info([LogDomain.DATABASE], 'Finding house', {
      key: key,
      searchQuery: searchQuery,
      projectId: projectId,
      userId: userId,
    });
    const query = {
      sql:
        'SELECT * FROM house JOIN project ON house.projectId = project.id ' +
        'WHERE house.projectId = project.id AND project.userId = user.id ' +
        `WHERE ${key} = ?;`,
      args: [searchQuery],
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.DATABASE], 'Error finding house', {
        error: err,
        key: key,
        searchQuery: searchQuery,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.info([LogDomain.DATABASE], 'No house found', {
        key: key,
        searchQuery: searchQuery,
        projectId: projectId,
        userId: userId,
      });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectHouseSchema.parse(response.rows[0]);
    logger.info([LogDomain.DATABASE], 'House operation completed successfully', {
      key: key,
      searchQuery: searchQuery,
      projectId: projectId,
      userId: userId,
      operation: 'findOneBy',
    });
    return result;
  }
}

export default HouseRepository;
