import { useCallback, useState } from 'react';
import { Agendamento } from './components/Agendamento';
import { Ambientes } from './components/Ambientes';
import { Clinica } from './components/Clinica';
import { Equipe } from './components/Equipe';
import { Especialidades } from './components/Especialidades';
import { Hero } from './components/Hero';
import { Rodape } from './components/Rodape';
import { AvisoDemo, Topo } from './components/Topo';
import { Visite } from './components/Visite';

export default function App() {
  const [grupo, setGrupo] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [prof, setProf] = useState<string | null>(null);

  const aoAgendar = useCallback((areaId: string, profId?: string) => {
    setArea(areaId);
    setProf(profId ?? null);
    requestAnimationFrame(() => {
      const alvo = document.getElementById('agendar');
      alvo?.scrollIntoView();
      alvo?.querySelector<HTMLInputElement>('input[type=radio]:checked')?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <AvisoDemo />
      <Topo />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Clinica aoEscolherGrupo={setGrupo} />
        <Especialidades grupo={grupo} setGrupo={setGrupo} aoVerPerfil={setPerfil} aoAgendar={aoAgendar} />
        <Equipe perfil={perfil} setPerfil={setPerfil} aoAgendar={aoAgendar} />
        <Ambientes />
        <Agendamento area={area} prof={prof} setArea={setArea} setProf={setProf} />
        <Visite />
      </main>
      <Rodape />
    </>
  );
}
