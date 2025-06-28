import dotenv from 'dotenv';
import type { Prompt } from '@/types/Prompt.d.js';
import type { JSONView } from '@/types/JsonView.d.js';
import { ConfigError } from '@/errors/ConfigError.js';
dotenv.config();

if (!process.env.HOUSIE_API_URL) {
  throw new ConfigError(
    'Missing Configuration Error', undefined,
    'An environment variable providing the API url should be provided'
  );
}

// TODO: Add proper error response
class PromptApiHandler {
  private static readonly API_URL: string = process.env.API_URL!;

  public static get = {
    /**
     * Read a prompt from the API.
     *
     * @param {string} id - The prompt unique identifier.
     * @returns {Promise<JSONView<Prompt>>} A promise containg the prompt.
     */
    prompt: async (id: string): Promise<JSONView<Prompt>> => {
      try {
        const response = await fetch(`${PromptApiHandler.API_URL}/prompt/${id}`, {
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
    },
    /**
     * Read the active prompt from the API.
     *
     * @returns {Promise<JSONView<Prompt>>} A promise containing the active prompt.
     */
    activePrompt: async (): Promise<JSONView<Prompt>> => {
      try {
        const response = await fetch(`${PromptApiHandler.API_URL}/prompt/active`, {
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
     * Post a prompt to the API.
     *
     * @param {Prompt} prompt - The prompt to save.
     * @returns {Promise<JSONView<Prompt>>} A promise containg the prompt saved.
     */
    prompt: async (prompt: Prompt): Promise<JSONView<Prompt>> => {
      try {
        const response = await fetch(`${PromptApiHandler.API_URL}/prompt`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
          body: JSON.stringify(prompt),
        });
        return await response.json();
      } catch (err) {
        // @ts-expect-error fixed later
        return err;
      }
    }
  };
}

export { PromptApiHandler };
