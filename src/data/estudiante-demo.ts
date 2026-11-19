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

export interface EstudianteDemo {
    stu_nombres: string;
    stu_apellido_paterno: string;
    stu_apellido_materno: string;
    stu_programa: string;
}

/**
 * Fictional members prefilled in the registration form ("The Couriers").
 * The 2099 year prefix cannot belong to a real student; these codes are resolved
 * locally and never sent to the UDH student service.
 */
export const ESTUDIANTES_DEMO: Record<string, EstudianteDemo> = {
    "2099110001": { stu_nombres: "Andrés Felipe", stu_apellido_paterno: "Paredes", stu_apellido_materno: "Quiroz", stu_programa: "Ingeniería de Sistemas e Informática" },
    "2099110002": { stu_nombres: "Sebastián Rodrigo", stu_apellido_paterno: "Llanos", stu_apellido_materno: "Vera", stu_programa: "Ingeniería Civil" },
    "2099110003": { stu_nombres: "Matías Ezequiel", stu_apellido_paterno: "Cornejo", stu_apellido_materno: "Ugarte", stu_programa: "Arquitectura" },
    "2099110004": { stu_nombres: "Franco Daniel", stu_apellido_paterno: "Aliaga", stu_apellido_materno: "Torres", stu_programa: "Administración de Empresas" },
    "2099110005": { stu_nombres: "Iván Alejandro", stu_apellido_paterno: "Ponce", stu_apellido_materno: "Huaringa", stu_programa: "Contabilidad y Finanzas" },
};

export const CODIGOS_DEMO = Object.keys(ESTUDIANTES_DEMO);
export const NOMBRE_EQUIPO_DEMO = "The Couriers";

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
export function getEstudianteDemo(codigo: string): EstudianteDemo {
    const conocido = ESTUDIANTES_DEMO[codigo.trim()];
    if (conocido) return conocido;

    const h = hash(codigo.trim());
    return {
        stu_nombres: NOMBRES[h % NOMBRES.length],
        stu_apellido_paterno: APELLIDOS[(h >>> 4) % APELLIDOS.length],
        stu_apellido_materno: APELLIDOS[(h >>> 8) % APELLIDOS.length],
        stu_programa: PROGRAMAS[(h >>> 12) % PROGRAMAS.length],
    };
}
