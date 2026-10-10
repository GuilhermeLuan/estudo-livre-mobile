import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Pilula } from '@/components/ui/Pilula';
import { Texto } from '@/components/ui/Texto';
import { espaco } from '@/constants/tema';
import { buscarCiclo } from '@/services/database';
import type { Ciclo as CicloTipo } from '@/types/banco';

export default function Ciclo() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ciclo, setCiclo] = useState<CicloTipo | null>(null);

  useEffect(() => {
    buscarCiclo(db, Number(id)).then(setCiclo);
  }, [db, id]);

  return (
    <View style={{ gap: espaco[8], padding: espaco[16] }}>
      <Texto estilo="tituloH1">{ciclo?.nome ?? 'Ciclo'}</Texto>
      {ciclo?.ativo ? <Pilula texto="Ativo" cor="azul" /> : null}
    </View>
  );
}
