import { useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

export default function MediaBlock({ block, isEditable, onUpdate }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditable && !block.url && block.name === 'Nueva imagen') {
      inputRef.current?.click();
    }
  }, []);

  const readAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Para la seleccion de archivos  (imagenes)
  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readAsDataUrl(file);
      onUpdate?.({
        ...block,
        url: dataUrl,
      });
    } catch (err) {
      console.error('Error reading image:', err);
    }
  };

  return (
    <div className="content-block media-block">
      <div className="block-body">
        {block.url ? (
          <div className="image-preview-container" style={{ position: 'relative' }}>
            <img
              src={block.url}
              alt={block.name || 'Imagen'}
              className="media-block-image"
              style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain' }}
            />
            {isEditable && (
              <button
                className="quiz-btn-secondary"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '0.4rem',
                  minWidth: 'auto',
                  background: 'rgba(255,255,255,0.9)'
                }}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={16} /> Cambiar
              </button>
            )}
          </div>
        ) : isEditable ? (
          <div className="simple-upload-box" onClick={() => inputRef.current?.click()}>
            <div className="simple-upload-box-icon">
              <Upload size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span className="simple-upload-box-title">
                Elija una imagen para cargar
              </span>
              <span className="simple-upload-box-subtitle">
                max. (50MB)
              </span>
            </div>
          </div>
        ) : (
          <div className="empty-state">Sin imagen</div>
        )}

        {isEditable && (
          <input
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePick}
          />
        )}
      </div>
    </div>
  );
}
