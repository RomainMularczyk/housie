import { InValue, ResultSet } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import { Connect } from '@/utils/connection/Connect.js';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { House, HouseDatabase } from '@/types/House.js';
import { SelectHouseSchema } from '@/types/validators/House.js';
import { LogDomain, logger } from '@/utils/logger.js';

const turso = Connect.toTursoDatabase();

class HouseRepository {
  // --------------------------------------------
  // -------------- GENERIC CRUD  --------------
  // --------------------------------------------

  /**
   * Save a house in the database.
   *
   * @param {Omit<HouseDatabase, 'id'>} house - The house to be saved.
   * @returns {Promise<House>} A promise containing the saved house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async create(house: Omit<HouseDatabase, 'id'>): Promise<House> {
    let response: ResultSet;
    const uuid = uuidv4();
    const query = {
      sql:
        'INSERT INTO house' +
        ' (id, name, description, price, size, rooms, dpe, url, city, postCode,' +
        ' isArchived, isFavorite, isUserPicked, isHousiaPicked)' +
        ' VALUES (:id, :name, :description, :price, :size, :rooms,' +
        ' :dpe, :url, :city, :postCode, :isArchived, :isFavorite, :isUserPicked,' +
        ' :isHousiaPicked) RETURNING *;',
      args: { id: uuid, ...house },
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
    const result = SelectHouseSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Read a house in the database.
   *
   * @param {string} id - The house unique identifier.
   * @returns {Promise<House>} A promise containing the house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readOne(id: string): Promise<House> {
    let response: ResultSet;
    const query = {
      sql: 'SELECT * FROM house WHERE id = ?;',
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
    const result = SelectHouseSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Read all houses in the database.
   *
   * @returns {Promise<House[]>} A promise containing the list of all houses.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async readAll(): Promise<House[] | []> {
    let response: ResultSet;
    const query = {
      sql: 'SELECT * FROM house;',
    };
    try {
      response = await turso.execute(query);
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      return [];
    }
    const result = response.rows.map((r) => SelectHouseSchema.parse(r));
    return result;
  }

  /**
   * Update a given house in the database.
   *
   * @param {string} id - The house unique identifier.
   * @param {Partial<HouseDatabase>} changes - The changes to apply on the house.
   * @returns {Promise<House>} A promise containing the updated house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async update(
    id: string,
    changes: Partial<HouseDatabase>
  ): Promise<House> {
    let response: ResultSet;
    const keys = Object.keys(changes) as Array<keyof HouseDatabase>;

    if (keys.length === 0) {
      throw new DatabaseError('Data Format Error', 'No changes were provided.');
    }

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => changes[key]) as InValue[];

    const query = {
      sql: `UPDATE house SET ${setClause} WHERE id = ? RETURNING *;`,
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
    const result = SelectHouseSchema.parse(response.rows[0]);
    return result;
  }

  /**
   * Delete a given house in the database.
   *
   * @param {string} id - The house unique identifier.
   * @returns {Promise<true>} Return `true` if the house was deleted
   * successfully.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async delete(id: string): Promise<true> {
    let response: ResultSet;
    const query = {
      sql: 'DELETE FROM house WHERE id = ?;',
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

  // -------------------------------------
  // -------------- CUSTOM  --------------
  // -------------------------------------

  /**
   * Find a house by a given key and search query.
   *
   * @param {{ key: string, searchQuery: string }} params - The key and
   * search query to use.
   * @returns {Promise<House>} A promise containing the found house.
   * @throws {DatabaseError} When an error occurred with the database.
   */
  public static async findOneBy({
    key,
    searchQuery,
  }: {
    key: string;
    searchQuery: string;
  }): Promise<House> {
    let response: ResultSet;
    const query = {
      sql: `SELECT * FROM house WHERE ${key} = ?;`,
      args: [searchQuery],
    };
    logger.info([LogDomain.DATABASE], 'Finding house', { key, searchQuery });
    try {
      response = await turso.execute(query);
    } catch (err) {
      logger.error([LogDomain.DATABASE], 'Error finding house', { err });
      throw new DatabaseError('Unknown Error', undefined, err);
    }
    if (response.rows.length === 0) {
      logger.warn([LogDomain.DATABASE], 'No house found', { key, searchQuery });
      throw new DatabaseError('No Result Error', undefined);
    }
    const result = SelectHouseSchema.parse(response.rows[0]);
    return result;
  }
}

export default HouseRepository;
