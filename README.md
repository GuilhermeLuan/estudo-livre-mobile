# Estudo Livre

App mobile para quem estuda para concursos. O estudo é organizado em **ciclos** (por exemplo, "Analista de TI do TRF1"), e cada ciclo tem suas matérias e etapas com carga horária.

Principais funcionalidades:

- **Hoje:** mostra o ciclo atual, a próxima etapa e as matérias.
- **Cronômetro:** mede uma sessão de estudo e a registra ao final.
- **Registro de estudo:** guarda matéria, conteúdo, duração, tipo de estudo, questões feitas e acertos.
- **Ciclos:** cria ciclos e reordena as etapas.
- **Estatísticas:** horas por semana, acerto por matéria e horas por matéria.

Projeto acadêmico feito com Expo (SDK 57), React Native, Expo Router, Zustand e expo-sqlite.

## Como rodar

Pré-requisitos: Node.js e o app **Expo Go** no celular, ou um emulador configurado.

```bash
npm install
npm start
```

Com o servidor aberto:

- **Android:** pressione `a` no terminal para abrir no emulador, ou leia o QR code com o Expo Go.
- **iOS:** pressione `i` para abrir no simulador (só no macOS, com Xcode), ou leia o QR code com a câmera do iPhone.

Atalhos: `npm run android` e `npm run ios`.

O `expo-sqlite` está incluído no Expo Go. Se adicionarmos uma biblioteca com código nativo fora do Expo Go, será preciso um development build: `npx expo run:android` ou `npx expo run:ios`.

## Estrutura

```
src/
├── app/          # rotas (Expo Router)
├── components/   # componentes de UI
├── hooks/
├── services/     # banco local (SQLite)
├── store/        # estado global (Zustand)
├── constants/
├── types/
└── utils/
```

## Comandos úteis

```bash
npx tsc --noEmit   # checagem de tipos
npx expo lint      # lint
```
