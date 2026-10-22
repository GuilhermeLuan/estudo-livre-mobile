import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { Texto } from '@/components/ui/Texto';
import { espaco } from '@/constants/tema';

export default function Hoje() {
  return (
    <View style={estilos.tela}>
      <Texto estilo="tituloH1">Hoje</Texto>
      <Botao rotulo="Registrar estudo" onPress={() => router.push('/registrar-estudo')} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { gap: espaco[16], padding: espaco[16], alignItems: 'flex-start' },
});
