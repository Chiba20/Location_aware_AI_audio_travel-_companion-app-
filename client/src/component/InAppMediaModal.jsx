import { useEffect } from "react";
import { ExternalLink, Image, Video, X } from "lucide-react";

function InAppMediaModal({ media, onClose }) {
  useEffect(() => {
    if (!media) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [media, onClose]);

  if (!media) return null;

  const MediaIcon = media.kind === "videos" ? Video : Image;
  const label = media.kind === "videos" ? "In-app video" : "In-app photo viewer";

  return (
    <div className="in-app-map-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="in-app-map-dialog in-app-media-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="in-app-media-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="in-app-map-header">
          <div>
            <span className="eyebrow">{label}</span>
            <h2 id="in-app-media-title"><MediaIcon size={19} /> {media.title}</h2>
          </div>
          <div className="in-app-media-header-actions">
            <a href={media.externalUrl} target="_blank" rel="noreferrer" aria-label={`Open ${media.title} in browser`}>
              <ExternalLink size={17} />
            </a>
            <button className="in-app-map-close" type="button" onClick={onClose} aria-label="Close media viewer">
              <X size={21} />
            </button>
          </div>
        </header>

        {media.mode === "image" ? (
          <div className="in-app-media-image-wrap">
            <img src={media.embedUrl} alt={media.title} />
          </div>
        ) : (
          <iframe
            className="in-app-map-frame"
            src={media.embedUrl}
            title={media.title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </section>
    </div>
  );
}

export default InAppMediaModal;
