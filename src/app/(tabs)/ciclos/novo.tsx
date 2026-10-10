import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { Campo } from '@/components/ui/Campo';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco } from '@/constants/tema';
import { criarCiclo } from '@/services/database';

const LIMITE_NOME = 60;

export default function NovoCiclo() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const travado = useRef(false);

  const nomeLimpo = nome.trim();
  const valido = nomeLimpo.length > 0 && nomeLimpo.length <= LIMITE_NOME;

  async function salvar() {
    if (!valido || travado.current) return;
    travado.current = true;
    setSalvando(true);
    try {
      await criarCiclo(db, nomeLimpo);
      router.back();
    } catch {
      travado.current = false;
      setSalvando(false);
      Alert.alert('Não foi possível criar o ciclo', 'Tente novamente.');
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: cores.paper }}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Texto estilo="tituloH1">Novo ciclo</Texto>
      <Campo
        tipo="texto"
        rotulo="Nome do ciclo"
        placeholder="Ex.: Concurso TRF"
        valor={nome}
        onChangeText={setNome}
        maxLength={LIMITE_NOME}
      />
      <View style={estilos.acoes}>
        <Botao rotulo="Cancelar" variante="secundario" onPress={() => router.back()} />
        <Botao rotulo="Criar ciclo" desabilitado={!valido || salvando} onPress={salvar} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { gap: espaco[16], padding: espaco[16] },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: espaco[8] },
});
