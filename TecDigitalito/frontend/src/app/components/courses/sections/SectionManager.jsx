import { Plus, Save } from 'lucide-react';

export default function SectionManager({ isEditable, onAddSection, onSave }) {
  if (!isEditable) return null;

  return (
    <div className="section-toolbar" style={{ display: 'flex', gap: '0.5rem' }}>
      <button className="btn btn-outline" onClick={onAddSection}>
        <Plus size={16} /> Agregar Sección
      </button>
      <button className="btn btn-primary" onClick={onSave}>
        <Save size={16} /> Guardar Contenido
      </button>
    </div>
  );
}
