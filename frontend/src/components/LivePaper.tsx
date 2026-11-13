'use client';

import { useEffect, useState } from 'react';
import { api, type Edition } from '@/lib/api';
import { Sheet } from './Chrome';
import { EditionView } from './EditionView';

/**
 * The front page. It paints at once from the edition baked in at build time,
 * then asks the API whether a newer edition has been printed since and, if
 * so, swaps it in. Readers get the newest paper without waiting on a rebuild.
 */
export function LivePaper({ baked }: { baked: Edition }) {
  const [edition, setEdition] = useState(baked);

  useEffect(() => {
    const controller = new AbortController();
    api
      .latestEdition(controller.signal)
      .then((latest) => {
        if (latest.id > baked.id || (latest.id === baked.id && latest.generatedAt > baked.generatedAt)) setEdition(latest);
      })
      .catch(() => {
        // The baked edition is already on screen; an unreachable API changes nothing for the reader.
      });
    return () => controller.abort();
  }, [baked]);

  return (
    <Sheet paper={edition} section="/">
      <EditionView edition={edition} />
    </Sheet>
  );
}
