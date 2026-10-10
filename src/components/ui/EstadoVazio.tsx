import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { cores, espaco, raio } from '@/constants/tema';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  texto: string;
  icone?: ReactNode;
  rotuloAcao?: string;
  onAcao?: () => void;
  rotuloAcaoSecundaria?: string;
  onAcaoSecundaria?: () => void;
};

export function EstadoVazio({
  titulo,
  texto,
  icone,
  rotuloAcao,
  onAcao,
  rotuloAcaoSecundaria,
  onAcaoSecundaria,
}: Props) {
  return (
    <View style={estilos.card}>
      <View style={estilos.icone}>{icone ?? <Icone nome="ciclos" cor={cores.ink2} />}</View>
      <Texto estilo="tituloH2" style={estilos.centro}>
        {titulo}
      </Texto>
      <Texto estilo="lista14" cor={cores.ink2} style={estilos.centro}>
        {texto}
      </Texto>
      {rotuloAcao || rotuloAcaoSecundaria ? (
        <View style={estilos.acoes}>
          {rotuloAcao ? <Botao rotulo={rotuloAcao} onPress={onAcao} /> : null}
          {rotuloAcaoSecundaria ? (
            <Botao rotulo={rotuloAcaoSecundaria} variante="discreto" onPress={onAcaoSecundaria} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: espaco[12],
    padding: espaco[24],
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.accentSoft,
  },
  centro: { textAlign: 'center', alignSelf: 'stretch' },
  acoes: { alignItems: 'center', gap: espaco[8] },
});
