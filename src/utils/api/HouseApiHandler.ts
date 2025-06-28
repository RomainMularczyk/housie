import dotenv from 'dotenv';
import type { House } from '@/types/House.d.js';
import type { JSONView } from '@/types/JsonView.d.js';
import { ConfigError } from '@/errors/ConfigError.js';
dotenv.config();

if (!process.env.HOUSIE_API_URL) {
  throw new ConfigError('Missing Configuration Error', undefined,
    'An environment variable providing the API url should be provided');
}

// TODO: Add proper error responses
class HouseApiHandler {
  private static readonly API_URL: string = process.env.HOUSIE_API_URL!;

  public static get = {
    /**
     * Read a house from the API.
     * 
     * @param {string} id - The house unique identifier.
     * @returns {Promise<JSONView<House>>} A promise containing the requested house.
     */
    house: async (id: string): Promise<JSONView<House>> => {
      try {
        const response = await fetch(`${HouseApiHandler.API_URL}/house/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });
        return await response.json();
      } catch (err) {
        // @ts-expect-error fixed later
        return err;
      }
    }
  };

  public static post = {
    /**
     * Post a house to the API.
     *
     * @param {Omit<House, 'id'>} house - The house to send to the API.
     * @returns {Promise<JSONView<House>>} A promise containg the saved house.
     */
    house: async (house: Omit<House, 'id'>): Promise<JSONView<House>> => {
      try {
        const response = await fetch(`${HouseApiHandler.API_URL}/house`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(house),
        });
        return await response.json();
      } catch (err) {
        // @ts-expect-error fixed later
        return err;
      }
    }
  };
}

export { HouseApiHandler };
