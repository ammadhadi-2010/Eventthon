import { canOpenPublicExplore } from './squadPermissions';
import { squadPublicPath } from './squadPublicPaths';

export async function openSquadPublicShowroom({ selectedSquad } = {}) {
  if (!selectedSquad?._id) {
    window.alert('Select a squad from the list first.');
    return;
  }

  if (!canOpenPublicExplore(selectedSquad)) {
    window.alert(
      'This squad is private. Only members can use it inside Squads.\n\n' +
        'To show a public Explore page, open Squad → Settings and enable "Public listing".'
    );
    return;
  }

  window.open(squadPublicPath(selectedSquad), '_blank', 'noopener,noreferrer');
}
