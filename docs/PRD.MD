# Estudo Livre — Spec do produto

## Problem Statement

Quem estuda para concursos públicos costuma montar um **ciclo de estudos**: uma lista ordenada de matérias, cada uma com uma carga horária, que se repete volta após volta. Hoje isso é controlado em planilhas ou cadernos, e o candidato perde o fio: não sabe qual é a próxima matéria, quanto falta para fechar a volta, quanto estudou na semana nem em quais matérias está errando mais. Quem presta mais de um concurso ainda precisa manter um ciclo para cada um, com metas diferentes para a mesma matéria.

## Solution

Um aplicativo mobile, em português do Brasil, com tema escuro, que funciona totalmente no aparelho (sem conta e sem internet). O candidato cria ciclos com etapas, registra o que estudou (manualmente ou com um cronômetro) e o app calcula sozinho o progresso da volta, indica a próxima etapa e mostra estatísticas de horas e de acerto de questões. O desenho das telas está no Figma "Estudo Livre".

## User Stories

### Ciclos
1. Como candidato, quero criar um ciclo com um nome, para organizar o estudo de cada concurso separadamente.
2. Como candidato, quero que o primeiro ciclo que criei já fique ativo, para ver meu estudo na tela inicial sem configurar nada.
3. Como candidato, quero ver a lista de todos os meus ciclos, para escolher qual abrir.
4. Como candidato, quero renomear um ciclo, para corrigir ou atualizar o nome do concurso.
5. Como candidato, quero excluir um ciclo, para me livrar de concursos que não estudo mais.
6. Como candidato, quero ser avisado de que excluir um ciclo também apaga seus registros, para não perder dados sem querer.
7. Como candidato, quero que, ao excluir o ciclo ativo, o ciclo mais recente dos que sobraram passe a ser o ativo, para que o app nunca fique sem ciclo ativo se ainda existir algum.
8. Como candidato, quero tornar ativo qualquer ciclo, para trocar de foco quando mudo de concurso.
9. Como candidato, quero que o nome do ciclo seja obrigatório e tenha no máximo 60 caracteres, para evitar nomes vazios ou enormes.
10. Como candidato, quero poder ter dois ciclos com o mesmo nome, para não ser impedido por uma regra desnecessária.

### Etapas
11. Como candidato, quero adicionar uma etapa ao ciclo informando a matéria e a carga horária, para montar minha rotina de estudo.
12. Como candidato, quero que a mesma matéria possa aparecer em várias etapas do mesmo ciclo, para dividir uma matéria grande em blocos espalhados pela volta.
13. Como candidato, quero informar a carga horária com decimais (por exemplo, 1,5), para planejar blocos de meia hora.
14. Como candidato, quero ver o total de horas do ciclo, para saber o tamanho de uma volta.
15. Como candidato, quero reordenar as etapas arrastando pela alça, para refletir a ordem que prefiro estudar.
16. Como candidato, quero que a ordem seja só uma sugestão, para poder estudar fora de ordem quando precisar.
17. Como candidato, quero editar a matéria e a carga horária de uma etapa, para corrigir o planejamento.
18. Como candidato, quero excluir uma etapa, com confirmação, para tirar matérias que saíram do meu plano.
19. Como candidato, quero que alterar a carga horária no meio de uma volta recalcule o progresso na hora, para que a tela sempre reflita a meta atual.
20. Como candidato, quero que renomear uma matéria mantenha meu histórico dela, para não perder o que já registrei.
21. Como candidato, quero que excluir a última etapa de uma matéria preserve seus registros nas estatísticas, para não perder o histórico de horas e acertos.

### Tela Hoje
22. Como candidato, quero ver o ciclo ativo e a data de hoje ao abrir o app, para começar a estudar sem navegar.
23. Como candidato, quero ver um disco do ciclo com uma fatia por etapa preenchida conforme o progresso, para entender a volta de relance.
24. Como candidato, quero ver o número da volta atual e quanto falta para fechá-la, para saber a distância até a meta.
25. Como candidato, quero ver quantas etapas já foram concluídas, para acompanhar o avanço.
26. Como candidato, quero ver qual é a próxima etapa e quanto já fiz dela nesta volta, para saber exatamente o que estudar agora.
27. Como candidato, quero que a próxima etapa seja a primeira da ordem que ainda não está cheia, para ter uma sugestão sempre atual.
28. Como candidato, quero ver a lista de matérias do ciclo com horas feitas, meta e barra de progresso, para acompanhar cada uma.
29. Como candidato, quero ver as horas extras de uma matéria destacadas (por exemplo, "+1h05 extra"), para saber quando passei da meta.
30. Como candidato, quero ver os outros ciclos na tela Hoje, para trocar de ciclo rapidamente.
31. Como candidato, quero ver um estado vazio com a opção "Criar primeiro ciclo" quando ainda não tenho ciclos, para saber por onde começar.

### Voltas
32. Como candidato, quero que a volta feche sozinha quando todas as etapas estiverem cheias, para não precisar fechá-la na mão.
33. Como candidato, quero que a nova volta comece zerada, para recomeçar o ciclo com a contagem limpa.
34. Como candidato, quero que as horas extras fiquem na volta em que foram feitas, para não distorcer a volta seguinte.
35. Como candidato, quero encerrar a volta manualmente e iniciar uma nova, para pular o que não consegui estudar.
36. Como candidato, quero confirmar antes de encerrar a volta manualmente, para não fazer isso por engano.
37. Como candidato, quero que o botão de nova volta só apareça quando a volta atual tem algum registro, para não encerrar uma volta vazia.
38. Como candidato, quero que as horas de uma volta encerrada continuem contando nas estatísticas, para não perder histórico.

### Registro de estudo
39. Como candidato, quero registrar um estudo informando matéria, conteúdo, data, duração, tipo, questões, acertos e anotação, para guardar o que fiz.
40. Como candidato, quero que a matéria venha pré-selecionada com a da próxima etapa, para registrar mais rápido.
41. Como candidato, quero escolher a matéria entre as do ciclo ativo, para não digitar nomes diferentes da mesma matéria.
42. Como candidato, quero que matéria e duração maior que zero sejam obrigatórias, para não salvar registros sem sentido.
43. Como candidato, quero que conteúdo, tipo, questões, acertos e anotação sejam opcionais, para registrar sem burocracia quando estou com pressa.
44. Como candidato, quero escolher um único tipo de estudo (Teoria, Exercícios, Revisão, Videoaula, Leitura de lei), para classificar a sessão.
45. Como candidato, quero que acertos nunca ultrapasse questões, para evitar dados impossíveis.
46. Como candidato, quero que o campo de acertos fique desabilitado enquanto não há questões, para não preencher na ordem errada.
47. Como candidato, quero escolher a data em um seletor nativo, para não errar o formato.
48. Como candidato, quero que a data padrão seja hoje e não possa ser futura, para registrar só o que de fato estudei.
49. Como candidato, quero registrar um estudo de dias anteriores, para lançar o que esqueci.
50. Como candidato, quero que um registro com data passada conte na volta que está aberta agora, para que o progresso do ciclo nunca volte atrás.
51. Como candidato, quero ver um aviso de confirmação ("Estudo registrado") ao salvar, para ter certeza de que gravou.
52. Como candidato, quero cancelar o formulário sem salvar, para descartar um registro que não quero mais.
53. Como candidato, quero que o formulário mostre o nome do ciclo para o qual estou registrando, para não registrar no lugar errado.

### Cronômetro
54. Como candidato, quero iniciar um cronômetro com um toque na tela Hoje, para medir o estudo sem calcular depois.
55. Como candidato, quero pausar e retomar o cronômetro, para descontar interrupções.
56. Como candidato, quero que o cronômetro continue contando com o app fechado, para poder usar outros apps ou bloquear o celular.
57. Como candidato, quero ver o cronômetro flutuando acima da barra inferior em todas as abas, para não perder a sessão ao navegar.
58. Como candidato, quero parar o cronômetro e ver o formulário já com a duração preenchida, para só confirmar o registro.
59. Como candidato, quero que a duração venha arredondada em minutos, para não lidar com segundos.
60. Como candidato, quero cancelar a sessão cronometrada, para descartar um tempo que não vale registrar.
61. Como candidato, quero que o cronômetro fique preso ao ciclo em que começou, para que trocar o ciclo ativo não misture sessões.
62. Como candidato, quero que haja só um cronômetro por vez, para evitar sessões sobrepostas.
63. Como candidato, quero que excluir um ciclo descarte o cronômetro que estava rodando nele, para não sobrar uma sessão órfã.

### Estatísticas
64. Como candidato, quero ver as horas estudadas por semana nas últimas 8 semanas, para perceber minha constância.
65. Como candidato, quero que a semana comece na segunda-feira e que a atual apareça marcada como "esta", para ler o gráfico sem dúvida.
66. Como candidato, quero ver a média semanal, calculada só com as semanas fechadas e contando semanas vazias como zero, para que a semana incompleta não puxe a média para baixo.
67. Como candidato, quero ver o percentual de acerto por matéria, para descobrir onde estou errando mais.
68. Como candidato, quero ver "sem dados" nas matérias sem questões registradas, para diferenciar de acerto zero.
69. Como candidato, quero ver o total de horas por matéria, para saber onde concentrei o estudo.
70. Como candidato, quero filtrar as estatísticas por um ciclo, para analisar um concurso de cada vez.
71. Como candidato, quero ver "Todos os ciclos" somando as matérias de mesmo nome, para ter uma visão geral do meu desempenho em cada disciplina.
72. Como candidato, quero que, com um ciclo filtrado, só apareçam as horas daquele ciclo, para não misturar concursos.

### Experiência geral
73. Como candidato, quero que o app funcione sem internet e sem conta, para estudar em qualquer lugar.
74. Como candidato, quero que o app use o tema escuro sempre, para ter a mesma aparência do design.
75. Como candidato, quero que os dados fiquem salvos ao fechar o app, para não perder meu histórico.
76. Como candidato, quero que toda exclusão peça confirmação, para não apagar nada sem querer.
77. Como avaliador do projeto, quero poder carregar dados de exemplo em ambiente de desenvolvimento, para demonstrar o app preenchido.
78. Como candidato, quero navegar por uma barra inferior com Hoje, Ciclos e Estatísticas, para chegar a qualquer área com um toque.

## Implementation Decisions

**Plataforma e armazenamento**
- App Expo/React Native com Expo Router, em português do Brasil e com tema escuro fixo.
- Todos os dados são locais, em SQLite. Não há conta, backend nem sincronização.
- Estado global em memória (Zustand) para o cronômetro e para o ciclo ativo selecionado em tela. A fonte da verdade dos dados é o SQLite.

**Modelo de domínio (glossário)**
- **Ciclo:** lista ordenada de etapas. Um único ciclo é o ativo. Tem um número de volta atual, que começa em 1.
- **Etapa:** pertence a um ciclo, tem posição, matéria e carga horária em minutos.
- **Matéria:** pertence ao ciclo e é identificada pelo nome normalizado (sem diferenciar maiúsculas, acentos e espaços nas pontas). A mesma matéria em ciclos diferentes tem metas e progresso independentes. Nas estatísticas "Todos os ciclos", matérias com a mesma chave são somadas.
- **Registro de estudo:** guarda ciclo, volta, matéria, data, duração em minutos e os campos opcionais (conteúdo, tipo, questões, acertos, anotação). A volta é a que estava aberta no momento de salvar, independentemente da data informada.
- **Volta:** passada completa pelo ciclo. Fecha automaticamente quando todas as etapas estão cheias, ou manualmente, com confirmação. Horas extras ficam na volta em que ocorreram.
- **Cronômetro:** uma única sessão por vez, presa ao ciclo em que começou, com pausa. Calculado por horários (início, tempo acumulado e momento da pausa), nunca por contagem em memória, para sobreviver ao app fechado.

**Esquema de dados**
- Ciclos: id, nome, ativo, volta atual, criado em.
- Etapas: id, ciclo, posição, matéria, chave da matéria, minutos.
- Registros: id, ciclo, volta, chave da matéria, conteúdo, data, minutos, tipo, questões, acertos, anotação, criado em.
- Cronômetro: no máximo uma linha, com ciclo, início, acumulado e momento da pausa.
- Não existe campo "etapa concluída" nem "progresso": tudo é derivado dos registros.

**Regras de cálculo (módulo de domínio puro, sem dependência de React nem de banco)**
- Distribuição de horas: as horas registradas de cada matéria na volta preenchem as etapas dessa matéria na ordem (a primeira enche antes). A sobra da última etapa da matéria vira "extra".
- Próxima etapa: a primeira etapa, na ordem do ciclo, que não está cheia.
- Falta para fechar: soma do que falta nas etapas não cheias (extras não abatem etapas de outras matérias).
- Etapas concluídas: contagem de etapas cheias.
- Volta fechada: todas as etapas cheias.
- Estatísticas semanais: semanas começando na segunda, 8 últimas incluindo a atual. A média usa as 7 semanas fechadas e conta as vazias como zero.
- Acerto por matéria: soma de acertos dividida pela soma de questões. Sem questões, "sem dados".
- Todas as regras recebem os dados como argumentos e o "agora" como parâmetro, para serem determinísticas.

**Ciclo ativo e exclusões**
- O primeiro ciclo criado nasce ativo. A troca é feita pelo botão "Tornar ativo" no detalhe do ciclo.
- Excluir ciclo apaga etapas e registros. Se era o ativo, o mais recentemente criado dos restantes assume. Se havia cronômetro nele, ele é descartado.
- Renomear matéria atualiza a chave nos registros. Excluir a última etapa de uma matéria preserva os registros.

**Telas e rotas**
- Barra inferior com Hoje, Ciclos e Estatísticas. Ciclos tem lista, detalhe com etapas e criação.
- Registrar estudo e registrar sessão cronometrada são modais.
- Editar etapa acontece no próprio item da lista: o item expande com nome da matéria, carga horária, "Salvar etapa" e "Remover etapa".
- As ações do ciclo ficam num card "Volta e ciclo" no detalhe do ciclo: "Tornar ativo" (só em ciclo inativo), "Iniciar nova volta" e "Excluir ciclo".
- Exclusões e nova volta passam por um diálogo de confirmação.
- O cartão do cronômetro fica no layout das abas, visível em todas elas, com "Pausar"/"Retomar", "Parar e registrar" e "Descartar".
- Estados vazios simples nas telas Hoje, Ciclos e Estatísticas.
- Toast de confirmação ao salvar.

**Dependências a adicionar** (versões verificadas contra o SDK 57 antes da instalação)
- Reordenação por arrastar (Reanimated, Gesture Handler e uma lista reordenável).
- Seletor de data nativo.
- Jest com preset do Expo.

**Dados de exemplo**
- Ação disponível apenas em `__DEV__`, no estado vazio, que carrega os ciclos do Figma.

**Validações**
- Nome do ciclo: obrigatório, até 60 caracteres, pode repetir.
- Carga horária da etapa: maior que zero, aceita decimais, guardada em minutos.
- Registro: matéria e duração maiores que zero obrigatórias; acertos não passa de questões e só habilita com questões; data não futura.

## Testing Decisions

- **Seam de teste:** o módulo de domínio puro. É o ponto mais alto possível: concentra todas as regras (distribuição de horas, próxima etapa, volta, estatísticas, normalização de matéria, cálculo do cronômetro), não depende de React, de banco nem de relógio, e é onde os erros são mais prováveis. A ideia é ter esse único seam. As telas ficam sem testes automatizados.
- **O que é um bom teste:** chama a função pública com dados de entrada e confere o resultado observável. Não confere detalhes internos, ordem de chamadas nem estruturas intermediárias.
- **Casos que devem ser cobertos:**
  - Matéria repetida em duas etapas, com horas que enchem a primeira e passam para a segunda.
  - Horas extras na última etapa da matéria.
  - Estudo fora de ordem e próxima etapa recalculada.
  - Volta que fecha sozinha e volta encerrada manualmente.
  - Registro com data passada contando na volta aberta.
  - Alteração de carga horária no meio da volta.
  - Normalização de nomes (maiúsculas, acentos, espaços).
  - Semanas das estatísticas (início na segunda, 8 semanas, média sem a semana atual, semanas vazias).
  - Acerto com e sem questões.
  - Cronômetro com pausa, retomada e sessões que cruzam a meia-noite.
- **Prior art:** não existe. O projeto não tem testes ainda, então este é o primeiro conjunto e define o padrão (Jest com preset do Expo).

## Out of Scope

- Conta de usuário, login, backend, sincronização entre aparelhos e backup na nuvem.
- Histórico de registros, com visualizar, editar e apagar um registro individual (fica para uma versão futura).
- Tema claro e outros idiomas.
- Notificações e lembretes.
- Exportar ou importar dados.
- Cadastro global de matérias ou de conteúdos.
- Testes automatizados de interface.
- Publicação nas lojas.

## Further Notes

- Design de referência: arquivo Figma "Estudo Livre" (https://www.figma.com/design/8tvJ8UjT5mA9rkQ7ZUzsjG/Estudo-Livre). São 9 telas originais (Hoje e suas variações com cronômetro ativo e estudo registrado, os dois formulários, Ciclos, Ciclo, Novo ciclo e Estatísticas) e 8 complementares.
- A seção "Complementos" do Figma desenha o que faltava nas 9 telas originais: ações do ciclo (ativo e inativo), confirmações de nova volta, exclusão de ciclo e remoção de etapa, e os estados vazios de Hoje, Ciclos e Estatísticas. Os componentes "Diálogo de confirmação" e "Estado vazio" estão na página Componentes.
- A edição de etapa e a pausa do cronômetro já existiam como variantes dos componentes "Item de etapa" (Aberto) e "Cronômetro" (Pausado).
- Projeto acadêmico: priorizar clareza das regras e cobertura do módulo de domínio sobre acabamento de interface.
