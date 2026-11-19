import { turso } from "@/turso";
import { getEquiposDemo } from "@/data/equipos-demo";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    try {
        const result = await turso.execute(
            "SELECT id, nombre_equipo, nombre_integrante1, codigo_operacion_yape, estado_pago, creado_en FROM equipos ORDER BY creado_en DESC"
        );
        return new Response(JSON.stringify({ success: true, equipos: result.rows }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.warn("Database unavailable, serving demo teams:", error.message);
        const equipos = getEquiposDemo(["id", "nombre_equipo", "nombre_integrante1", "codigo_operacion_yape", "estado_pago", "creado_en"]);
        return new Response(JSON.stringify({ success: true, equipos, demo: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};
