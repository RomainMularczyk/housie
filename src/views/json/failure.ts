import { AuthenticationError } from '@/errors/AuthenticationError.js';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { HTTPParsingError } from '@/errors/HTTPParsingError.js';
import { JSONParsingError } from '@/errors/JSONParsingError.js';
import { ZodError, ZodIssue } from 'zod';

/**
 * Retourne une vue JSON qui décrit l'erreur levée sur l'API.
 *
 * @param {unknown} err - The error.
 * @returns {Response} - Réponse HTTP contenant une vue JSON décrivant
 * l'erreur levée.
 */
const failure = (err: unknown): Response => {
  if (err instanceof HTTPParsingError) {
    return new Response(
      JSON.stringify({
        status: 'failure',
        message: err.message,
        details: {
          error: err,
        },
      }),
      { headers: { 'content-type': 'application/json' }, status: err.status }
    );
  }
  if (err instanceof JSONParsingError) {
    return new Response(
      JSON.stringify({
        status: 'failure',
        message: err.message,
      }),
      { headers: { 'content-type': 'application/json' }, status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return new Response(
      JSON.stringify({
        status: 'failure',
        message: 'The request body could not be validated properly.',
        details: {
          issues: err.issues.reduce(
            (acc: { [key: string]: ZodIssue }, issue: ZodIssue) => {
              acc[issue.path[0]] = issue;
              return acc;
            },
            {}
          ),
        },
      }),
      { headers: { 'content-type': 'application/json' }, status: 422 }
    );
  }

  // -------- DATABASE ERRORS --------

  if (err instanceof DatabaseError) {
    return new Response(
      JSON.stringify({
        status: 'failure',
        message: 'A constraint error occurred with the database.',
        details: {
          issues: err.message,
        },
      }),
      { headers: { 'content-type': 'application/json' }, status: 409 }
    );
  }

  // -------- AUTHENTICATION ERRORS --------

  if (err instanceof AuthenticationError) {
    return new Response(
      JSON.stringify({
        status: 'failure',
        message: 'An authentication error occurred.',
        details: {
          error: err,
        },
      }),
      { headers: { 'content-type': 'application/json' }, status: 401 }
    );
  }

  // -------- UNKNOWN ERRORS --------

  return new Response(
    JSON.stringify({
      status: 'failure',
      message: 'Internal server error. An unknown error happened.',
      details: {
        error: err,
      },
    }),
    { headers: { 'content-type': 'application/json' }, status: 500 }
  );
};

export { failure };
