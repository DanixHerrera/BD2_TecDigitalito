import { useState } from 'react';
import { Plus, Type, FileText, Image } from 'lucide-react';
import TextBlock from './TextBlock';
import FileBlock from './FileBlock';
import MediaBlock from './MediaBlock';

const BLOCK_TYPES = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'file', label: 'Archivo', icon: FileText },
  { type: 'image', label: 'Imagen', icon: Image },
];

const NEW_BLOCK = {
  text: { type: 'text', content: '' },
  file: { type: 'file', name: 'Nuevo archivo', size: '0 KB', url: '#' },
  image: { type: 'image', name: 'Nueva imagen', url: '', caption: '' },
};

export default function BlockEditor({ blocks = [], isEditable, onBlocksChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleUpdate = (index, updatedBlock) => {
    const next = [...blocks];
    next[index] = updatedBlock;
    onBlocksChange?.(next);
  };

  const handleAdd = (type) => {
    const newBlock = { ...NEW_BLOCK[type], id: `blk-${Date.now()}` };
    onBlocksChange?.([...blocks, newBlock]);
    setMenuOpen(false);
  };

  const handleRemove = (index) => {
    onBlocksChange?.(blocks.filter((_, i) => i !== index));
  };

  if (blocks.length === 0 && !isEditable) {
    return <div className="empty-state"><p className="empty-state-text">Sin contenido</p></div>;
  }

  return (
    <div className="blocks-container">
      {blocks.map((block, i) => {
        const key = block.id || i;
        switch (block.type) {
          case 'text':
            return <TextBlock key={key} block={block} isEditable={isEditable} onUpdate={(b) => handleUpdate(i, b)} />;
          case 'file':
            return <FileBlock key={key} block={block} isEditable={isEditable} />;
          case 'image':
            return <MediaBlock key={key} block={block} />;
          default:
            return null;
        }
      })}

      {isEditable && (
        <div className="block-add-dropdown">
          <button className="quiz-btn-secondary" onClick={() => setMenuOpen(!menuOpen)}>
            <Plus size={14} /> Agregar bloque
          </button>
          {menuOpen && (
            <div className="block-add-menu">
              {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                <button key={type} className="block-add-menu-item" onClick={() => handleAdd(type)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
