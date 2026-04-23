export default function TextBlock({ block, isEditable, onUpdate }) {
  if (isEditable) {
    return (
      <div className="content-block">
        <div className="block-body">
          <textarea
            className="text-block-textarea"
            value={block.content}
            onChange={(e) => onUpdate?.({ ...block, content: e.target.value })}
            placeholder="Escribe el contenido aquí..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="content-block">
      <div className="block-body">
        <p className="text-block-content">{block.content}</p>
      </div>
    </div>
  );
}
