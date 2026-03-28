import { Link, useParams, useSearchParams } from 'react-router-dom';
import ModeratorView from './ModeratorView';
import ParticipantView from './ParticipantView';

/**
 * Routing-Container: Liest Session-ID und optionalen mod-Token aus der URL,
 * rendert je nach Vorhandensein des Tokens Moderator- oder Teilnehmer-Ansicht.
 * sessionExpired wird innerhalb der jeweiligen Views behandelt.
 */
export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const modToken = searchParams.get('mod') ?? undefined;
  // BUG-FEAT1-QA-014: pass new-session flag to ModeratorView
  const isNew = searchParams.get('new') === '1';

  if (!id || !/^\d{4}$/.test(id)) {
    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        {/* BUG-FEAT1-UX-024: role="alert" so screen readers announce the error immediately */}
        <p role="alert" style={{ fontSize: '18px', fontWeight: 500 }}>Ungültige Session-Nummer.</p>
        <Link
          to="/"
          style={{
            color: 'var(--color-accent)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Zurück zur Startseite
        </Link>
      </main>
    );
  }

  if (modToken) {
    return <ModeratorView sessionId={id} modToken={modToken} isNew={isNew} />;
  }

  return <ParticipantView sessionId={id} />;
}
