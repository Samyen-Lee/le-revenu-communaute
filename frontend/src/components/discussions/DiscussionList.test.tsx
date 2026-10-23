import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '@/components/ui/EmptyState';
import { author, discussion } from '@/test/fixtures';
import { DiscussionList } from './DiscussionList';

describe('DiscussionList — affichage des discussions', () => {
  const discussions = [
    discussion(),
    discussion({
      documentId: 'discussion-2',
      title: 'Taux de la BCE : suivez-vous ses décisions ?',
      slug: 'taux-de-la-bce',
      type: 'discussion',
      repliesCount: 0,
      author: author({ displayName: 'La rédaction du Revenu', memberType: 'redaction' }),
    }),
  ];

  it('présente titre, espace, auteur, nombre de réponses et date de chaque discussion', () => {
    render(<DiscussionList discussions={discussions} empty={null} />);
    const [first] = screen.getAllByRole('article');

    expect(within(first).getByRole('link', { name: discussions[0].title })).toHaveAttribute(
      'href',
      '/discussions/ouvrir-un-pea-avec-5-000-par-ou-commencer',
    );
    expect(within(first).getByRole('link', { name: 'Bourse & actions' })).toHaveAttribute('href', '/espaces/bourse');
    expect(within(first).getByText('Thomas')).toBeInTheDocument();
    expect(within(first).getByText('Question')).toBeInTheDocument();
    expect(within(first).getByTitle('Réponses')).toHaveTextContent('4');
    expect(within(first).getByText(/réponses$/)).toBeInTheDocument();
    expect(first.querySelector('time')).toHaveAttribute('dateTime', discussions[0].publishedAt);
  });

  it('signale la rédaction et les discussions sans réponse', () => {
    render(<DiscussionList discussions={discussions} empty={null} />);
    const second = screen.getAllByRole('article')[1];

    expect(within(second).getByText('Rédaction')).toBeInTheDocument();
    expect(within(second).getByText('Discussion')).toBeInTheDocument();
    expect(within(second).getByText('réponse')).toBeInTheDocument();
  });

  it('affiche l’état vide fourni quand il n’y a aucune discussion', () => {
    render(<DiscussionList discussions={[]} empty={<EmptyState title="Rien ici pour l’instant" />} />);
    expect(screen.getByRole('heading', { name: 'Rien ici pour l’instant' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('propose une vue compacte en lignes avec les colonnes réponses et activité', () => {
    render(<DiscussionList discussions={discussions} density="compact" empty={null} />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText('Activité')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: discussions[1].title })).toHaveAttribute('href', '/discussions/taux-de-la-bce');
  });
});
