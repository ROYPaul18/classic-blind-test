import React from 'react';

interface HintSectionProps {
  hints: { birth: boolean; death: boolean; style: boolean; portrait: boolean; };
  composerInfo: { birth?: string; death?: string; epoch?: string; };
}

const HintSection: React.FC<HintSectionProps> = ({ hints, composerInfo }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-xl mt-6 mb-4">Demander un indice :</h3>
      {hints.birth && <p>Date de naissance : {composerInfo?.birth}</p>}
      {hints.death && <p>Date de mort : {composerInfo?.death}</p>}
      {hints.style && <p>Style musical : {composerInfo?.epoch}</p>}
      {hints.portrait && <p>Portrait du compositeur : (image ou description ici)</p>}
    </div>
  );
};

export default HintSection;
