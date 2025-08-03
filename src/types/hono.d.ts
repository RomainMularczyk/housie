import { Session, User } from 'better-auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    session: Session;
  }
}
