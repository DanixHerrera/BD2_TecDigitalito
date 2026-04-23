/**
 * Utilidades modulares para el manejo de colores.
 * Funciones puras o utilitarias sin efectos secundarios en el DOM global.
 */

/**
 * Extrae el color dominante de una imagen utilizando un elemento canvas en memoria.
 * Agrupa colores similares y omite blancos/negros puros para obtener un color más vibrante.
 * 
 * @param {string} imageUrl - URL (blob o data) de la imagen a procesar.
 * @returns {Promise<string>} - Promesa que resuelve a un string 'rgb(r, g, b)' o un color hexadecimal de fallback.
 */
export const getDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      // Usar un canvas en memoria (no afecta el DOM)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Escalar a 64x64 para hacer el procesamiento ultra rápido y evitar bloqueos del hilo principal
      const size = 64; 
      canvas.width = size;
      canvas.height = size;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, size, size);
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        const colorCounts = {};
        let maxCount = 0;
        let dominantRgb = null;

        // Iterar los píxeles (R, G, B, A)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // 1. Ignorar píxeles transparentes
          if (a < 128) continue;
          
          // 2. Ignorar tonos muy cercanos al blanco puro o negro puro
          if ((r < 30 && g < 30 && b < 30) || (r > 230 && g > 230 && b > 230)) {
              continue;
          }

          // 3. Cuantización (agrupación): Máscara de bits para agrupar colores parecidos
          // Usamos 0xE0 (11100000 en binario) para agrupar tonos en "cajas" grandes
          const rQ = r & 0xE0; 
          const gQ = g & 0xE0;
          const bQ = b & 0xE0;
          const key = `${rQ},${gQ},${bQ}`;

          colorCounts[key] = (colorCounts[key] || 0) + 1;

          // Si este "grupo" de colores es el más frecuente, guardamos el RGB real de este píxel representativo
          if (colorCounts[key] > maxCount) {
            maxCount = colorCounts[key];
            dominantRgb = `rgb(${r}, ${g}, ${b})`;
          }
        }
        
        // Retornar el color encontrado, o el color de la paleta por defecto si no halló nada útil
        resolve(dominantRgb || '#7d7e80'); 
      } catch (err) {
        console.error('Error procesando imagen para color:', err);
        resolve('#7d7e80');
      }
    };

    img.onerror = () => {
      resolve('#7d7e80'); // Fallback seguro
    };
    
    img.src = imageUrl;
  });
};
