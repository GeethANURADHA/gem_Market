import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Tag, Weight, Layers, Phone, Mail } from "lucide-react";
import { gemService } from "../services/gemService";
import "./GemDetails.css";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?w=800&h=800&fit=crop";

const GemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gem, setGem] = useState(
    /** @type {null | {id:string,name:string,description:string,price:number,carat:number,imageUrl:string,category:string}} */ (null)
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchGem = async () => {
      try {
        if (!id) { 
          console.warn("GemDetails: No ID provided in URL");
          navigate("/"); 
          return; 
        }
        console.log("GemDetails: Fetching gem with ID:", id);
        const foundGem = await gemService.getById(id);
        console.log("GemDetails: Result found:", foundGem);

        if (foundGem) {
          setGem(foundGem);
        } else {
          console.warn("GemDetails: Gem not found in database for ID:", id);
          navigate("/");
        }
      } catch (err) {
        console.error("GemDetails: Failed to load gem:", err);
        navigate("/");
      }
    };
    fetchGem();
  }, [id, navigate]);

  if (!gem) {
    return (
      <div className="gd-loading">
        <div className="gd-spinner" />
        <span>Loading gem details…</span>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in purchasing: ${gem.name} (${gem.carat || 'N/A'} ct) — $${(gem.price || 0).toLocaleString()}`
  );

  return (
    <div className="gd-page">
      {/* ── Breadcrumb / Back ───────────────────────── */}
      <div className="gd-breadcrumb">
        <button className="gd-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back to Gems
        </button>
        <span className="gd-breadcrumb-sep">/</span>
        <span className="gd-breadcrumb-current">{gem.name}</span>
      </div>

      {/* ── Main card ───────────────────────────────── */}
      <div className="gd-card">

        {/* Left: Image */}
        <div className="gd-image-col">
          <div className={`gd-image-wrapper ${imgLoaded ? "loaded" : ""}`}>
            <img
              src={gem.imageUrl || FALLBACK_IMG}
              alt={gem.name}
              className="gd-image"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { 
                console.warn("Gem image failed to load, using fallback:", gem.imageUrl);
                /** @type {HTMLImageElement} */(e.target).src = FALLBACK_IMG; 
                setImgLoaded(true); 
              }}
            />
            {/* Category badge */}
            {gem.category && (
              <span className="gd-category-badge">{gem.category}</span>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="gd-info-col">
          <h1 className="gd-title">{gem.name}</h1>

          {/* Price */}
          <div className="gd-price-row">
            <span className="gd-price">${(gem.price || 0).toLocaleString()}</span>
            <span className="gd-price-label">USD</span>
          </div>

          {/* Gem specs chips */}
          <div className="gd-specs">
            {gem.carat ? (
              <div className="gd-spec-chip">
                <Weight size={14} />
                <span>{gem.carat} ct</span>
              </div>
            ) : null}
            {gem.category && (
              <div className="gd-spec-chip">
                <Layers size={14} />
                <span>{gem.category}</span>
              </div>
            )}
            <div className="gd-spec-chip">
              <Tag size={14} />
              <span>Natural</span>
            </div>
          </div>

          <div className="gd-divider" />

          {/* Description */}
          <div className="gd-description">
            <h3>Description</h3>
            <p>{gem.description || "No description available."}</p>
          </div>

          <div className="gd-divider" />

          {/* CTA Buttons */}
          <div className="gd-actions">
            <a
              href={`https://wa.me/94701190000?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="gd-btn gd-btn-whatsapp"
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
                <path d="M16.003 3C9.374 3 4 8.373 4 15.003c0 2.28.64 4.41 1.752 6.22L4 29l7.98-1.726A12.93 12.93 0 0016.003 28C22.63 28 28 22.627 28 16.003 28 9.374 22.629 3 16.003 3zm0 23.6a10.56 10.56 0 01-5.386-1.473l-.386-.23-4.736 1.025 1.056-4.614-.252-.397A10.535 10.535 0 015.4 15.003C5.4 9.147 10.147 4.4 16.003 4.4c5.855 0 10.597 4.747 10.597 10.603 0 5.855-4.742 10.597-10.597 10.597zm5.814-7.94c-.318-.16-1.88-.928-2.172-1.034-.292-.106-.505-.16-.718.16-.213.32-.824 1.034-.01 1.248.104.028 1.278.623 1.758.861.09.044.186.062.28.062.222 0 .437-.095.601-.283.266-.307.797-.962 1.04-1.293.21-.287.046-.567-.18-.72zm-3.08 3.01c-.424.237-.876.356-1.334.356-.677 0-1.348-.22-1.898-.632l-.225-.166-2.33.503.517-2.26-.175-.234a5.24 5.24 0 01-.977-3.04c0-2.892 2.354-5.245 5.248-5.245 2.89 0 5.244 2.353 5.244 5.246 0 2.891-2.353 5.24-5.07 5.472z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <button
              className="gd-btn gd-btn-inquiry"
              onClick={() => {
                const subject = encodeURIComponent(`Purchase Inquiry: ${gem.name}`);
                const body = encodeURIComponent(`Hi,\n\nI'd like to inquire about: ${gem.name} (${gem.carat || 'N/A'} ct) - $${(gem.price || 0).toLocaleString()}.\n\nPlease get back to me.\n\nThank you.`);
                window.location.href = `mailto:vetrovivo.lk@gmail.com?subject=${subject}&body=${body}`;
              }}
            >
              <ShoppingBag size={18} />
              Purchase Inquiry
            </button>
          </div>

          {/* Contact strip */}
          <div className="gd-contact-strip">
            <a href="tel:0701190000" className="gd-contact-link">
              <Phone size={13} /> 070 119 xxxx
            </a>
            <a href="mailto:vetrovivo.lk@gmail.com" className="gd-contact-link">
              <Mail size={13} /> vetrovivo.lk@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemDetails;
