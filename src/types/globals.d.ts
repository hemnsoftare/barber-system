export {};

// Create a type for the roles
export type Roles = "admin" | "barber";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
