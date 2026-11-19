import { createClient, type Client } from "@libsql/client/web";

function createTursoClient(): Client {
    try {
        return createClient({
            url: import.meta.env.TURSO_DATABASE_URL,
            authToken: import.meta.env.TURSO_AUTH_TOKEN,
        });
    } catch (error) {
        // Missing or invalid credentials must not crash every module that imports the client.
        // Defer the failure to query time so each endpoint can handle it (e.g. serve demo data).
        console.warn("Turso client unavailable:", (error as Error).message);
        const fail = () => Promise.reject(error);
        return { execute: fail, batch: fail } as unknown as Client;
    }
}

export const turso = createTursoClient();
