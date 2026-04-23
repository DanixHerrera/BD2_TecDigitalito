export default function MediaBlock({ block }) {
  return (
    <div className="content-block">
      <div className="block-body">
        <img src={block.url} alt={block.name} className="media-block-image" />
        {block.caption && <p className="media-block-caption">{block.caption}</p>}
      </div>
    </div>
  );
}
