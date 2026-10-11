import type { Metadata } from 'next';
import ModelsHeader from '@/components/models/ModelsHeader';
import JournalExperience from '@/components/journal/JournalExperience';

export const metadata: Metadata = {
  title: 'Journal | OKNO Modhomes',
  description: 'Projects, process and independent coverage of OKNO Modhomes.',
};

export default function JournalPage() {
  return (
    <main data-route="journal">
      <ModelsHeader currentHref="/journal" />
      <JournalExperience />
    </main>
  );
}
