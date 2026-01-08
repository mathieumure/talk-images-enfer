import type { ReactNode } from 'react';

interface BrowserMockupProps {
  imageSrc?: string;
  imageAlt?: string;
  children?: ReactNode;
}

export default function BrowserMockup({ imageSrc, imageAlt, children }: BrowserMockupProps) {
  return (
    <div className="srcset-browser-mockup">
      <div className="srcset-browser-chrome">
        <div className="srcset-browser-dots">
          <span className="srcset-dot"></span>
          <span className="srcset-dot"></span>
          <span className="srcset-dot"></span>
        </div>
        <div className="srcset-browser-address">localhost:4321</div>
      </div>
      <div className="srcset-browser-content">
        {imageSrc && <img src={imageSrc} alt={imageAlt || ''} />}
        {children}
      </div>
    </div>
  );
}