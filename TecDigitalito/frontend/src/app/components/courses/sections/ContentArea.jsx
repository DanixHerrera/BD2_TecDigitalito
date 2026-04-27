import { useState } from 'react';
import SectionManager from './SectionManager';
import SectionTree from './SectionTree';

export default function ContentArea({ contentTree = [], isEditable, onSaveContent }) {
  const [draftNodes, setDraftNodes] = useState(null);
  const nodes = draftNodes ?? contentTree;

  const handleAddSection = () => {
    const newSection = {
      id: `sec-${crypto.randomUUID()}`,
      title: 'Nueva Sección',
      type: 'section',
      children: [],
    };

    setDraftNodes([...(nodes || []), newSection]);
  };

  return (
    <div className="content-area-wrapper">
      <SectionManager 
        isEditable={isEditable} 
        onAddSection={handleAddSection} 
        onSave={() => onSaveContent?.(nodes)}
      />
      <SectionTree nodes={nodes} isEditable={isEditable} onNodesChange={setDraftNodes} />
    </div>
  );
}
