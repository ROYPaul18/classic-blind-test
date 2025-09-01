import { NextRequest, NextResponse } from 'next/server';

interface Composer {
  id: number;
  name: string;
  complete_name: string;
  birth: string;
  death: string;
  epoch: string;
  portrait: string;
}

interface ApiResponse {
  composers: Composer[];
}

export async function GET(request: NextRequest) {
  const composerId = request.nextUrl.searchParams.get('composerId') || '1'; // Par défaut, Beethoven

  try {
    const response = await fetch(`https://api.openopus.org/composer/list/pop.json`);
    const data: ApiResponse = await response.json();

    const composer = data.composers.find((composer: Composer) => composer.id === parseInt(composerId));

    if (composer) {
      return NextResponse.json(composer);
    } else {
      return NextResponse.json({ error: 'Composer not found' }, { status: 404 });
    }
  } catch {
    // Gestion des erreurs si l'appel à l'API échoue
    return NextResponse.json({ error: 'Failed to fetch composer info' }, { status: 500 });
  }
}
