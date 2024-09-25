import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // Ajoute accessToken au type de Session
    error?: string;
  }

  interface JWT {
    accessToken?: string; // Ajoute accessToken au type JWT
  }
}