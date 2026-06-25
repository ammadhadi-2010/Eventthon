import React from 'react';
import { FiCheck, FiImage, FiPaperclip, FiDownload } from 'react-icons/fi';

const GigExplorerOverviewTab = ({
  selectedGig,
  mediaItems,
  activeMedia,
  setActiveMedia,
}) => (
  <>
    <div className="gigx-hero-media">
      {mediaItems[activeMedia]?.startsWith('http') ? (
        <img src={mediaItems[activeMedia]} alt={selectedGig.title} />
      ) : (
        <div className="gigx-media-placeholder">{selectedGig.category.toUpperCase()}</div>
      )}
    </div>
    <div className="gigx-media-strip">
      {mediaItems.slice(0, 4).map((src, idx) => (
        <button
          key={`${src}-${idx}`}
          type="button"
          className={idx === activeMedia ? 'is-active' : ''}
          onClick={() => setActiveMedia(idx)}
        >
          {src.startsWith('http') ? <img src={src} alt={`thumb-${idx + 1}`} /> : <span>{idx + 1}</span>}
        </button>
      ))}
    </div>

    <div className="gigx-about-card">
      <h3>About This Gig</h3>
      {/<[a-z][^>]*>/i.test(selectedGig.description || '') ? (
        <div
          className="gigx-html-desc"
          dangerouslySetInnerHTML={{ __html: selectedGig.description }}
        />
      ) : (
        <p>{selectedGig.description}</p>
      )}
      <ul>
        {(selectedGig.packageFeatures.length ? selectedGig.packageFeatures : ['Service Delivery', 'Quality Output']).map((feature) => (
          <li key={feature}><FiCheck size={12} /> {feature}</li>
        ))}
      </ul>
      <div className="gigx-tags">
        {(selectedGig.tags.length ? selectedGig.tags : ['General']).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {selectedGig.addons.length ? (
        <div className="gigx-addons-wrap">
          <h4>Add-ons available</h4>
          <div className="gigx-addon-chips">
            {selectedGig.addons.map((addon) => (
              <span key={addon} className="gigx-addon-chip">{addon}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>

    <div className="gigx-assets">
      <h4><FiImage size={13} /> Uploaded Images</h4>
      {selectedGig.images.length ? (
        <div className="gigx-asset-grid">
          {selectedGig.images.map((src) => (
            <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt="gig-upload" /></a>
          ))}
        </div>
      ) : (
        <p>No image uploaded from Create Gig yet.</p>
      )}
    </div>

    <div className="gigx-assets">
      <h4><FiPaperclip size={13} /> Uploaded Files</h4>
      {selectedGig.files.length ? (
        <div className="gigx-files">
          {selectedGig.files.map((src) => (
            <a key={src} href={src} target="_blank" rel="noreferrer">
              <FiDownload size={12} /> {src.split('/').pop()}
            </a>
          ))}
        </div>
      ) : (
        <p>No file uploaded from Create Gig yet.</p>
      )}
    </div>
  </>
);

export default GigExplorerOverviewTab;
