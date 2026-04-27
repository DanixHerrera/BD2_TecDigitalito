import { useState } from 'react';
import { ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import BlockEditor from '../content-blocks/BlockEditor';

export default function SectionTree({ nodes = [], isEditable, onNodesChange }) {
  return (
    <div className="section-tree">
      {nodes.map((node, i) => (
        <TreeNode
          key={node.id}
          node={node}
          isEditable={isEditable}
          onUpdate={(updated) => {
            const next = [...nodes];
            next[i] = updated;
            onNodesChange?.(next);
          }}
          onRemove={() => onNodesChange?.(nodes.filter((_, idx) => idx !== i))}
        />
      ))}
      {nodes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p className="empty-state-text">No hay contenido aún</p>
        </div>
      )}
    </div>
  );
}

function TreeNode({ node, isEditable, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);

  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.type === 'subtopic';

  const childType = node.type === 'section' ? 'topic' : node.type === 'topic' ? 'subtopic' : null;
  const childLabel = node.type === 'section' ? 'Tema' : node.type === 'topic' ? 'Subtema' : null;

  const handleSaveTitle = () => {
    onUpdate({ ...node, title: editTitle });
    setEditing(false);
  };

  const handleAddChild = () => {
    const newChild = {
      id: `${childType}-${Date.now()}`,
      title: `Nuevo ${childLabel}`,
      type: childType,
      children: childType !== 'subtopic' ? [] : undefined,
      blocks: childType === 'subtopic' ? [] : undefined,
    };
    const updatedChildren = [...(node.children || []), newChild];
    onUpdate({ ...node, children: updatedChildren });
    setExpanded(true);
  };

  const handleChildUpdate = (idx, updatedChild) => {
    const next = [...(node.children || [])];
    next[idx] = updatedChild;
    onUpdate({ ...node, children: next });
  };

  const handleChildRemove = (idx) => {
    onUpdate({ ...node, children: (node.children || []).filter((_, i) => i !== idx) });
  };

  const handleBlocksChange = (newBlocks) => {
    onUpdate({ ...node, blocks: newBlocks });
  };

  return (
    <div className="tree-node">
      <div className="tree-node-header" onClick={() => setExpanded(!expanded)}>
        <ChevronRight size={16} className={`tree-chevron ${expanded ? 'open' : ''}`} />

        {editing ? (
          <input
            className="inline-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="tree-node-title">{node.title}</span>
        )}

        {isEditable && (
          <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
            {childType && (
              <button className="tree-action-btn" title={`Agregar ${childLabel}`} onClick={handleAddChild}>
                <Plus size={14} />
              </button>
            )}
            <button className="tree-action-btn" title="Editar nombre" onClick={() => setEditing(true)}>
              <Pencil size={14} />
            </button>
            <button className="tree-action-btn destructive" title="Eliminar" onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="tree-node-children">
          {hasChildren && node.children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              isEditable={isEditable}
              onUpdate={(u) => handleChildUpdate(i, u)}
              onRemove={() => handleChildRemove(i)}
            />
          ))}

          {isLeaf && (
            <BlockEditor
              blocks={node.blocks || []}
              isEditable={isEditable}
              onBlocksChange={handleBlocksChange}
            />
          )}

          {!hasChildren && !isLeaf && (
            <div className="empty-state">
              <p className="empty-state-text">Sin {childLabel?.toLowerCase()}s aún</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
