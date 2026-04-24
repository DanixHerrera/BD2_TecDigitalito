import { Plus } from 'lucide-react';

export default function SectionManager({ isEditable, onAddSection }) {
  if (!isEditable) return null;

  return (
    <div className="section-toolbar">
      <button className="btn btn-outline" onClick={onAddSection}>
        <Plus size={16} /> Agregar Sección
      </button>
    </div>
  );
}
