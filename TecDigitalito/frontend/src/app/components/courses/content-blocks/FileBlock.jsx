import { FileText, Download } from 'lucide-react';

export default function FileBlock({ block, isEditable }) {
  return (
    <div className="content-block">
      <div className="block-body">
        <div className="file-block-item">
          <FileText size={18} className="file-block-icon" />
          <span className="file-block-name">{block.name}</span>
          <span className="file-block-size">{block.size}</span>
          <a href={block.url} className="file-block-download" title="Descargar">
            <Download size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
