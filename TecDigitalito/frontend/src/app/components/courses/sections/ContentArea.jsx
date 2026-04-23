import { useState } from 'react';
import SectionManager from './SectionManager';
import SectionTree from './SectionTree';

export default function ContentArea({ contentTree = [], isEditable }) {
  const [nodes, setNodes] = useState(contentTree);

  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
      title: 'Nueva Sección',
      type: 'section',
      children: [],
    };
    setNodes([...nodes, newSection]);
  };

  return (
    <div className="content-area-wrapper">
      <SectionManager isEditable={isEditable} onAddSection={handleAddSection} />
      <SectionTree nodes={nodes} isEditable={isEditable} onNodesChange={setNodes} />
    </div>
  );
}
