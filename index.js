const axios = require('axios');
const fs = require('fs');

const URL = 'https://huggingface.co/api/resolve-cache/datasets/MMG/SpanishBFF/893b20897a66275ef9a5105da5b4a98847cc1694/SpanishBFF_0_2.json?%2Fdatasets%2FMMG%2FSpanishBFF%2Fresolve%2Fmain%2FSpanishBFF_0_2.json=&etag=%227e07f9a507f9ddf3ce3f6e703688490def4d8965%22';

async function descargarYProcesar() {
    try {
        console.log('Descargando diccionario (esto puede tardar un poco)...');
        const response = await axios.get(URL);
        const datos = response.data;

        // Objeto donde agruparemos por longitud
        const diccionarioFiltrado = {
            "4": [], "5": [], "6": [], "7": [], "8": [], "9": []
        };

        console.log('Procesando palabras...');

        datos.forEach(item => {
            if (item.lemma) {
                // Limpiamos la palabra: pasamos a mayúsculas y quitamos espacios
                let palabra = item.lemma.toUpperCase().trim();
                
                // Opcional: Eliminar tildes para que el juego sea más sencillo
                // palabra = palabra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                const longitud = palabra.length.toString();

                // Si la longitud está en nuestro rango deseado y es una sola palabra (sin espacios)
                if (diccionarioFiltrado.hasOwnProperty(longitud) && !palabra.includes(' ')) {
                    // Evitamos duplicados
                    if (!diccionarioFiltrado[longitud].includes(palabra)) {
                        diccionarioFiltrado[longitud].push(palabra);
                    }
                }
            }
        });

        // Guardar el resultado en un archivo JSON
        const nombreArchivo = 'diccionario.json';
        fs.writeFileSync(nombreArchivo, JSON.stringify(diccionarioFiltrado, null, 2));

        console.log(`¡Listo! Archivo generado: ${nombreArchivo}`);
        console.log('Resumen de palabras encontradas:');
        Object.keys(diccionarioFiltrado).forEach(len => {
            console.log(`${len} letras: ${diccionarioFiltrado[len].length} palabras`);
        });

    } catch (error) {
        console.error('Error al procesar el diccionario:', error.message);
    }
}

descargarYProcesar();
