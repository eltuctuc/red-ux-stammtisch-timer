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
        <p style={{ fontSize: '18px', fontWeight: 500 }}>Ungültige Session-Nummer.</p>
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
    return <ModeratorView sessionId={id} modToken={modToken} />;
  }

  return <ParticipantView sessionId={id} />;
}
