import turso from '../database/database';
import { DatabaseError } from '../errors/DatabaseError';
import { House } from '../types/House';
import { SelectHouseSchema } from '../validators/House';

class HouseRepository {
  public static async create(house: House): Promise<House> {
    try {
      const query = {
        sql: 'INSERT INTO house '
          + '(name, description, price, size, rooms, dpe, address, url) '
          + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: Object.values(house),
      };
      const response = await turso.execute(query);
      const result = SelectHouseSchema.parse(response.rows[0]);
      return result;
    } catch (err) {
      throw new DatabaseError('Unknown Error', undefined, err);
    }
  }

  public static async read(id?: number): Promise<House | House[]> {
    if (id) {
      const query = {
        sql: 'SELECT * FROM house WHERE (?);',
        args: [id],
      };
      const response = await turso.execute(query);
      const result = SelectHouseSchema.parse(response.rows[0]);
      return result;
    } else {
      const query = {
        sql: 'SELECT * FROM house;',
      };
      const response = await turso.execute(query);
      const result = response.rows.map((r) => SelectHouseSchema.parse(r));
      return result;
    }
  }

  public static async delete(id: number): Promise<boolean> {
    const query = {
      sql: 'DELETE FROM house WHERE (?);',
      args: [id],
    };
    try {
      const response = await turso.execute(query);
      return response.rows;
    } catch (err) {
      return false;
    }
  }
}

export default HouseRepository;
