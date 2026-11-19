import type { APIRoute } from 'astro';
import { ESTUDIANTES_DEMO, getEstudianteDemo } from '@/data/estudiante-demo';

const UDH_API_BASE_URL = "http://www.udh.edu.pe/websauh/secretaria_general/gradosytitulos/datos_estudiante_json.aspx?_c_3456=";
const UDH_API_TIMEOUT_MS = 5000;

/** Queries the UDH student service. Throws when it is unreachable, too slow, or answers with an error. */
async function fetchEstudiantesUdh(codigoEstudiante: string): Promise<any> {
    const response = await fetch(`${UDH_API_BASE_URL}${codigoEstudiante}`, {
        signal: AbortSignal.timeout(UDH_API_TIMEOUT_MS),
    });
    if (!response.ok) {
        throw new Error(`UDH API responded ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { codigoEstudiante } = body;

        if (!codigoEstudiante) {
            return new Response(
                JSON.stringify({ success: false, message: 'Código de estudiante es requerido.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Prefilled demo members are resolved locally, without calling the UDH service.
        const estudianteDemo = ESTUDIANTES_DEMO[String(codigoEstudiante).trim()];
        if (estudianteDemo) {
            return new Response(
                JSON.stringify({ success: true, data: [estudianteDemo], demo: true }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        let externalData;
        try {
            externalData = await fetchEstudiantesUdh(codigoEstudiante);
        } catch (error: any) {
            console.warn("UDH API unavailable, serving demo student:", error.message);
            return new Response(
                JSON.stringify({ success: true, data: [getEstudianteDemo(String(codigoEstudiante))], demo: true }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        if (externalData && externalData.length > 0) {
            const estudianteOriginal = externalData[0];
            const estudianteFiltrado = {
                stu_nombres: estudianteOriginal.stu_nombres,
                stu_apellido_paterno: estudianteOriginal.stu_apellido_paterno,
                stu_apellido_materno: estudianteOriginal.stu_apellido_materno,
                stu_programa: estudianteOriginal.stu_programa,
            };

            return new Response(
                JSON.stringify({ success: true, data: [estudianteFiltrado] }), // Enviar el objeto filtrado
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            // Si la API externa no devuelve datos o un array vacío
            return new Response(
                JSON.stringify({ success: false, message: 'No se encontraron datos para el código proporcionado.' }),

            );
        }

    } catch (error: any) {
        console.error('Error en el proxy API /api/verificar-estudiante:', error);
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
            return new Response(
                JSON.stringify({ success: false, message: 'JSON malformado en la solicitud.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        return new Response(
            JSON.stringify({ success: false, message: 'Error interno del servidor en el proxy.' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};