import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseBlocks, Prose } from './Prose';

describe('Prose', () => {
  it('découpe paragraphes et listes', () => {
    expect(parseBlocks('Bonjour,\n\n**Pour démarrer :**\n- un\n- deux\n\nFin')).toEqual([
      { kind: 'paragraph', lines: ['Bonjour,'] },
      { kind: 'paragraph', lines: ['**Pour démarrer :**'] },
      { kind: 'list', items: ['un', 'deux'] },
      { kind: 'paragraph', lines: ['Fin'] },
    ]);
  });

  it('met en gras et transforme les @mentions en liens de profil', () => {
    render(<Prose text={'Très bonne réponse de @Vincent_ETF. **Comparez les frais.**'} />);
    expect(screen.getByText('Comparez les frais.').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: '@Vincent_ETF' })).toHaveAttribute('href', '/membres/Vincent_ETF');
  });

  it('n’interprète jamais le HTML saisi par un membre', () => {
    const { container } = render(<Prose text={'<img src=x onerror="alert(1)"> <script>alert(1)</script>'} />);
    expect(container.querySelector('img, script')).toBeNull();
    expect(container).toHaveTextContent('<script>alert(1)</script>');
  });
});
