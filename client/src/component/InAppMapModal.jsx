import { useEffect } from "react";
import { MapPin, X } from "lucide-react";

function InAppMapModal({ title, mapUrl, onClose }) {
  useEffect(() => {
    if (!mapUrl) return undefined;

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
  }, [mapUrl, onClose]);

  if (!mapUrl) return null;

  return (
    <div className="in-app-map-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="in-app-map-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="in-app-map-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="in-app-map-header">
          <div>
            <span className="eyebrow">In-app map</span>
            <h2 id="in-app-map-title"><MapPin size={19} /> {title}</h2>
          </div>
          <button className="in-app-map-close" type="button" onClick={onClose} aria-label="Close map">
            <X size={21} />
          </button>
        </header>
        <iframe
          className="in-app-map-frame"
          src={mapUrl}
          title={`Map for ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </div>
  );
}

export default InAppMapModal;
