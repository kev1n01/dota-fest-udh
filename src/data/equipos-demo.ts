import equiposDemo from "./equipos-demo.json";

export type EquipoDemo = (typeof equiposDemo)[number];

/**
 * Demo teams used when the database is unreachable.
 * Returns only the requested columns, newest first (mirrors `ORDER BY creado_en DESC`).
 */
export function getEquiposDemo<K extends keyof EquipoDemo>(columns: readonly K[]): Pick<EquipoDemo, K>[] {
    return [...equiposDemo]
        .sort((a, b) => b.creado_en.localeCompare(a.creado_en))
        .map((equipo) => Object.fromEntries(columns.map((column) => [column, equipo[column]])) as Pick<EquipoDemo, K>);
}
