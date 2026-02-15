const axios = require("axios");
const fs = require("fs");
const path = require("path");

const URL =
  "https://huggingface.co/api/resolve-cache/datasets/MMG/SpanishBFF/893b20897a66275ef9a5105da5b4a98847cc1694/SpanishBFF_0_2.json?%2Fdatasets%2FMMG%2FSpanishBFF%2Fresolve%2Fmain%2FSpanishBFF_0_2.json=&etag=%227e07f9a507f9ddf3ce3f6e703688490def4d8965%22";

// Directorio de salida (puedes apuntar esto a tu carpeta assets de Angular)
const OUTPUT_DIR = "./diccionarios";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

function limpiarAcentos(palabra) {
  // 1. Reemplazamos las vocales con tilde manualmente
  const mapa = {
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
    Á: "A",
    É: "E",
    Í: "I",
    Ó: "O",
    Ú: "U",
  };
  return palabra.replace(/[áéíóúÁÉÍÓÚ]/g, (match) => mapa[match]);
}

async function procesar() {
  try {
    console.log("Descargando datos...");
    const { data } = await axios.get(URL);

    // Mapa para organizar las palabras
    const colecciones = { 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };

    console.log("Limpiando y clasificando palabras...");

    data.forEach((item) => {
      if (item.lemma) {
        // 1. A mayúsculas y quitar espacios
        let palabra = item.lemma.toUpperCase().trim();

        // 2. Quitar tildes
        palabra = limpiarAcentos(palabra);

        const len = palabra.length;

        // 3. Filtrar: solo palabras de una sola pieza y longitud 4-9
        if (len >= 4 && len <= 9 && !palabra.includes(" ")) {
          if (!colecciones[len].includes(palabra)) {
            colecciones[len].push(palabra);
          }
        }
      }
    });

    // 4. Generar archivos individuales
    console.log("Guardando archivos...");
    Object.entries(colecciones).forEach(([key, lista]) => {
      const fileName = `diccionario${key}letras.json`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      // Ordenar alfabéticamente antes de guardar (opcional pero prolijo)
      lista.sort();

      fs.writeFileSync(filePath, JSON.stringify(lista, null, 2));
      console.log(`✅ Creado: ${fileName} (${lista.length} palabras)`);
    });

    console.log("\n¡Proceso terminado con éxito!");
  } catch (error) {
    console.error("Error fatal:", error.message);
  }
}

procesar();
