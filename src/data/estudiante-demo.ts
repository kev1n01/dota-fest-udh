const NOMBRES = [
    "Diego Alonso", "Bruno Sebastián", "Mateo Andrés", "Luis Fernando",
    "Gabriel Antonio", "Santiago Rafael", "Emilio José", "Nicolás Benjamín",
    "Álvaro Gustavo", "Rodrigo Martín", "Sergio Abel", "Joaquín Elías",
    "Adrián Marcelo", "Thiago Nicolás", "Leonardo Javier", "Martín Alejandro",
];

const APELLIDOS = [
    "Ramírez", "Quispe", "Huamán", "Torres", "Espinoza", "Rojas", "Mendoza", "Chávez",
    "Valdivia", "Zevallos", "Ortega", "Villanueva", "Carrasco", "Reyes", "Peña", "Cabrera",
];

const PROGRAMAS = [
    "Ingeniería de Sistemas e Informática", "Ingeniería Civil", "Ingeniería Ambiental", "Arquitectura",
    "Administración de Empresas", "Contabilidad y Finanzas", "Derecho y Ciencias Políticas", "Psicología",
];

/** FNV-1a hash, so the same student code always maps to the same demo student. */
function hash(value: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/**
 * Fictional student used when the UDH student service is unreachable.
 * Mirrors the fields returned by /api/verificar-estudiante.
 */
export function getEstudianteDemo(codigo: string) {
    const h = hash(codigo.trim());
    return {
        stu_nombres: NOMBRES[h % NOMBRES.length],
        stu_apellido_paterno: APELLIDOS[(h >>> 4) % APELLIDOS.length],
        stu_apellido_materno: APELLIDOS[(h >>> 8) % APELLIDOS.length],
        stu_programa: PROGRAMAS[(h >>> 12) % PROGRAMAS.length],
    };
}
