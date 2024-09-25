import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const composerId = request.nextUrl.searchParams.get('composerId') || '1'; // Par défaut, Beethoven

  try {
    const response = await fetch(`https://api.openopus.org/composer/list/pop.json`);
    const data = await response.json();

    const composer = data.composers.find((composer: any) => composer.id === parseInt(composerId));

    // Vérification de la sérialisation JSON : s'assurer que 'composer' est sérialisable
    if (composer) {
      // Assurez-vous que vous ne retournez que des objets sérialisables en JSON
      return NextResponse.json(composer);
    } else {
      return NextResponse.json({ error: 'Composer not found' }, { status: 404 });
    }
  } catch (error) {
    // Gestion des erreurs si l'appel à l'API échoue
    return NextResponse.json({ error: 'Failed to fetch composer info' }, { status: 500 });
  }
}
