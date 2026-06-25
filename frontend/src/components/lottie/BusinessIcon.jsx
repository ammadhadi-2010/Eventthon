import React, { memo, useCallback, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './business-icon.css';

class LottieRenderGuard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onFail?.();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * Lightweight corporate Lottie slot — fixed dimensions, no layout shift.
 * @param {string} src — URL to .lottie or Lottie JSON
 * @param {number} size — width/height in px
 * @param {string} label — English accessibility label
 */
const BusinessIcon = memo(function BusinessIcon({
  src,
  size = 24,
  loop = true,
  autoplay = true,
  className = '',
  label = 'Animated status icon',
}) {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);

  const box = { width: size, height: size };

  if (!src || failed) {
    return (
      <span
        className={`biz-icon biz-icon--fallback ${className}`.trim()}
        style={box}
        role="img"
        aria-label={label}
      />
    );
  }

  return (
    <div className={`biz-icon ${className}`.trim()} style={box} title={label} aria-hidden>
      <LottieRenderGuard onFail={handleError}>
        <DotLottieReact
          src={src}
          loop={loop}
          autoplay={autoplay}
          style={{ width: '100%', height: '100%' }}
          onLoadError={handleError}
        />
      </LottieRenderGuard>
    </div>
  );
});

export default BusinessIcon;
