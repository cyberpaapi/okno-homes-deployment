import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TextBlock from './TextBlock';

vi.mock('motion/react', () => ({
  motion: {
    span: (allProps: React.HTMLAttributes<HTMLSpanElement> & { initial?: unknown; animate?: unknown; transition?: unknown }) => {
      const props = { ...allProps };
      delete props.initial;
      delete props.animate;
      delete props.transition;
      return <span {...props} />;
    },
  },
  useInView: () => true,
  useReducedMotion: () => false,
}));

describe('landing text block', () => {
  it('reveals clean text lines without a colored cover or mask', () => {
    const { container } = render(<TextBlock lines={['Precision-built homes.', 'Made to live.']} />);
    expect(container.querySelectorAll('[data-text-line]')).toHaveLength(2);
    expect(container.querySelector('[data-text-cover]')).toBeNull();
    expect(container).toHaveTextContent('Precision-built homes. Made to live.');
  });
});
