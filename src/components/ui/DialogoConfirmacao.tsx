import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { cores, espaco, padding, raio, sombras } from '@/constants/tema';
import { Botao } from './Botao';
import { Texto } from './Texto';

type Props = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  tom?: 'neutro' | 'perigo';
  rotuloConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function DialogoConfirmacao({
  visivel,
  titulo,
  mensagem,
  tom = 'neutro',
  rotuloConfirmar,
  onConfirmar,
  onCancelar,
}: Props) {
  const perigo = tom === 'perigo';
  return (
    <Modal transparent visible={visivel} animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={estilos.scrim} onPress={onCancelar}>
        {/* Pressable interno impede que toques no diálogo fechem o modal. */}
        <Pressable accessibilityViewIsModal style={estilos.dialogo}>
          <Texto estilo="tituloDialogo">{titulo}</Texto>
          <Texto estilo="lista14" cor={cores.ink2}>
            {mensagem}
          </Texto>
          <View style={estilos.rodape}>
            <Botao rotulo="Cancelar" variante="secundario" onPress={onCancelar} />
            <Botao
              rotulo={rotuloConfirmar ?? (perigo ? 'Excluir' : 'Confirmar')}
              variante={perigo ? 'perigo' : 'primario'}
              onPress={onConfirmar}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco[24],
    backgroundColor: cores.scrim,
  },
  dialogo: {
    width: '100%',
    maxWidth: 311,
    gap: espaco[16],
    padding: padding.hero,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
    ...sombras.flutuante,
  },
  rodape: { flexDirection: 'row', justifyContent: 'flex-end', gap: espaco[10] },
});
