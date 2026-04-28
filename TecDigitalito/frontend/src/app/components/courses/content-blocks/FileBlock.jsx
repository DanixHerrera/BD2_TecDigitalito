import { useRef, useEffect } from 'react';
import { FileText, Download, Upload } from 'lucide-react';

export default function FileBlock({ block, isEditable, onUpdate }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditable && (!block.url || block.url === '#') && block.name === 'Nuevo archivo') {
      inputRef.current?.click();
    }
  }, []);
  // Se le pidio a la IA un conversor de bytes a megabytes y gigabytes 
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const readAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Seleccion de archivos 
  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readAsDataUrl(file);
      onUpdate?.({
        ...block,
        name: file.name,
        size: formatBytes(file.size),
        url: dataUrl,
      });
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };
  // Verificacion de si existe el archivo  el "#" es un placeholder por si no se sube uno 
  const hasFile = block.url && block.url !== '#';

  if (!hasFile && isEditable) {
    return (
      // Este es el cuadro de dialogo para subir archivos 
      <div className="content-block">
        <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={handlePick} />
        <div className="simple-upload-box" onClick={() => inputRef.current?.click()}>
          <div className="simple-upload-box-icon">
            <Upload size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="simple-upload-box-title">
              Elija un archivo para cargar
            </span>
            <span className="simple-upload-box-subtitle">
              max. (50MB)
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-block">
      <div className="block-body">
        <div className="file-block-item">
          <FileText size={18} className="file-block-icon" />
          <div className="file-block-info">
            <span className="file-block-name">{block.name}</span>
            {block.size && <span className="file-block-size">{block.size}</span>}
          </div>

          <div className="file-block-actions">
            {isEditable && (
              <>
                <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={handlePick} />
                <button
                  type="button"
                  className="quiz-btn-secondary"
                  style={{ padding: '0.4rem', minWidth: 'auto' }}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload size={16} />
                </button>
              </>
            )}

            {hasFile && (
              <a href={block.url} download={block.name} className="file-block-download" style={{ marginLeft: '0.5rem' }}>
                <Download size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
