import React, { useState } from "react";

var LUNA_SYSTEM_PROMPT = [
  "Você se chama LUNA — Linguagem Unificada de Narrativas Atraentes.",
  "Você é uma especialista em criação de roteiros de Reels para empreendedoras, treinada na metodologia DIVA do programa Mulheres Magnéticas.",
  "",
  "Sua personalidade:",
  "- Direta, estratégica e sem rodeios",
  "- Empática com as dores reais de empreendedoras",
  "- Tom de conversa entre mulheres que se respeitam",
  "- Confiante sem arrogância, magnética sem artificialismo",
  "- Nunca genérica — sempre específica ao nicho e à persona",
  "",
  "OS 4 FRAMEWORKS DIVA:",
  "",
  "D — DESIGUALTURA",
  "Objetivo: parar o scroll por fricção cognitiva.",
  "Estrutura: GANCHO (afirmação contraintuitiva, máx 12 palavras, nunca comece com Oi/Olá/apresentação) → TRANSIÇÃO (acolhimento, desativa defensividade, máx 2 frases) → REENQUADRAMENTO (perspectiva nova com exemplo do nicho, 3-5 frases) → CTA (único, magnético, não desesperado)",
  "",
  "I — INSPIRAÇÃO",
  "Objetivo: criar identificação emocional profunda.",
  "Estrutura: PONTE EMOCIONAL (começa onde a persona está, tom eu te vejo) → VIRADA (novo ângulo, sem clichê, sem você consegue) → CHAMADO GENTIL (pergunta ou reflexão, NÃO é CTA de venda)",
  "",
  "V — VENDA",
  "Objetivo: ativar o desejo pelo resultado e direcionar para a oferta.",
  "Estrutura: GANCHO DE DOR (problema específico que a persona conhece) → PONTE DA POSSIBILIDADE (estado desejado, tom de possibilidade não de promessa exagerada) → PROVA OU MECANISMO (razão concreta para acreditar) → OFERTA + CTA (claro, direto, tom de abundância)",
  "",
  "A — AUTORIDADE",
  "Objetivo: estabelecer credibilidade que facilita a compra futura.",
  "Estrutura: GANCHO DE VALOR (promete conhecimento específico, usa número ou estrutura clara) → DESENVOLVIMENTO (entrega profunda, específica ao nicho) → INSIGHT EXCLUSIVO (ângulo que só especialista daria) → CTA DE RELACIONAMENTO (salvar, comentar, compartilhar — não venda)",
  "",
  "FORMATO DE OUTPUT OBRIGATÓRIO:",
  "",
  "Sempre gere o roteiro neste formato exato:",
  "",
  "ROTEIRO LUNA — [TIPO] | [TEMA]",
  "Nicho: [nicho] | Persona: [persona]",
  "Duração estimada: [X a Y segundos]",
  "",
  "[GANCHO — primeiros 3 segundos]",
  "[texto]",
  "",
  "[DESENVOLVIMENTO]",
  "[texto]",
  "",
  "[FECHAMENTO + CTA]",
  "[texto]",
  "",
  "NOTAS DE PRODUÇÃO:",
  "Legenda sobreposta: [texto]",
  "Tom de voz: [orientação]",
  "Trilha: [sugestão]",
  "",
  "RESTRIÇÕES — NUNCA:",
  "- Começa com Oi gente ou apresentação pessoal",
  "- Gera conteúdo genérico que serve para qualquer nicho",
  "- Usa mais de um CTA por roteiro",
  "- Cria conteúdo desesperado ou súplica",
  "- Usa clichês motivacionais vazios",
  "- Ultrapassa 90 segundos estimados",
  "- Mistura dois tipos DIVA no mesmo roteiro",
  "",
  "Se o input estiver incompleto, pergunte especificamente o que falta antes de gerar."
].join("\n");

var DIVA_CONFIG = {
  D: { label: "D — Desigualtura", emoji: "⚡", desc: "Provoca, quebra crenças, para o scroll", border: "#B8863C" },
  I: { label: "I — Inspiração", emoji: "💜", desc: "Conexão emocional profunda, identificação", border: "#6B4A8A" },
  V: { label: "V — Venda", emoji: "💰", desc: "Transforma desejo em ação, converte", border: "#1A6B6B" },
  A: { label: "A — Autoridade", emoji: "🎓", desc: "Credibilidade, expertise, confiança", border: "#2C3E7A" }
};

var DIVA_DESC = {
  D: "Um gancho que quebra uma crença da sua persona, acolhimento que desativa a defensividade, reposicionamento com perspectiva nova e CTA magnético.",
  I: "Um conteúdo que começa onde sua persona está emocionalmente, oferece um novo ângulo sem clichê, e termina com um convite interno — não uma venda.",
  V: "Nomeia a dor que a persona conhece de dentro, mostra a transformação possível, apresenta razão concreta para acreditar e direciona para a oferta sem desespero.",
  A: "Promete e entrega conhecimento específico e útil, com profundidade real, um insight exclusivo que só especialista daria, e CTA de relacionamento — não de venda."
};

export default function Luna() {
  var tipoState = useState("");
  var tipo = tipoState[0];
  var setTipo = tipoState[1];

  var nichoState = useState("");
  var nicho = nichoState[0];
  var setNicho = nichoState[1];

  var personaState = useState("");
  var persona = personaState[0];
  var setPersona = personaState[1];

  var temaState = useState("");
  var tema = temaState[0];
  var setTema = temaState[1];

  var ctaState = useState("");
  var cta = ctaState[0];
  var setCta = ctaState[1];

  var roteiroState = useState("");
  var roteiro = roteiroState[0];
  var setRoteiro = roteiroState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var copiedState = useState(false);
  var copied = copiedState[0];
  var setCopied = copiedState[1];

  var chatState = useState([]);
  var chat = chatState[0];
  var setChat = chatState[1];

  var refinamentoState = useState("");
  var refinamento = refinamentoState[0];
  var setRefinamento = refinamentoState[1];

  var canGenerate = tipo && nicho && persona && tema && cta;
  var divaAtual = tipo ? DIVA_CONFIG[tipo] : null;

  function gerarRoteiro() {
    if (!canGenerate) { return; }
    setLoading(true);
    setError("");
    setRoteiro("");

    var userMessage = "Tipo DIVA: " + tipo + "\nNicho: " + nicho + "\nPersona: " + persona + "\nTema do Reel: " + tema + "\nObjetivo do CTA: " + cta;
    var messages = chat.concat([{ role: "user", content: userMessage }]);

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: LUNA_SYSTEM_PROMPT,
        messages: messages
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      var block = data.content && data.content.find(function(b) { return b.type === "text"; });
      var text = block ? block.text : "";
      setRoteiro(text);
      setChat(messages.concat([{ role: "assistant", content: text }]));
      setLoading(false);
    }).catch(function() {
      setError("Erro ao conectar com LUNA. Tente novamente.");
      setLoading(false);
    });
  }

  function refinarRoteiro(instrucao) {
    if (!instrucao || !instrucao.trim() || loading) { return; }
    setLoading(true);
    setError("");

    var messages = chat.concat([{ role: "user", content: instrucao }]);

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: LUNA_SYSTEM_PROMPT,
        messages: messages
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      var block = data.content && data.content.find(function(b) { return b.type === "text"; });
      var text = block ? block.text : "";
      setRoteiro(text);
      setChat(messages.concat([{ role: "assistant", content: text }]));
      setRefinamento("");
      setLoading(false);
    }).catch(function() {
      setError("Erro ao refinar. Tente novamente.");
      setLoading(false);
    });
  }

  function copiar() {
    navigator.clipboard.writeText(roteiro);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  function novo() {
    setRoteiro("");
    setChat([]);
    setTipo("");
    setNicho("");
    setPersona("");
    setTema("");
    setCta("");
    setError("");
    setRefinamento("");
  }

  var sugestoes = [
    "Reescreva o gancho — mais provocador",
    "Tom ficou genérico — adapte ao nicho",
    "Crie 3 versões do gancho",
    "CTA fraco — reescreva com urgência real",
    "Adapte para legenda de post",
    "Versão mais curta — 30 segundos"
  ];

  var campos = [
    { label: "Seu nicho", key: "nicho", val: nicho, set: setNicho, ph: "Ex: Esteticista em SP especializada em rejuvenescimento facial", rows: 2 },
    { label: "Persona — quem vai assistir", key: "persona", val: persona, set: setPersona, ph: "Ex: Mulheres 35-50 anos, querem resultado sem cirurgia, já tentaram cremes caros", rows: 2 },
    { label: "Tema do Reel", key: "tema", val: tema, set: setTema, ph: "Ex: Por que o skincare caseiro pode estar envelhecendo sua pele", rows: 2 },
    { label: "Objetivo do CTA", key: "cta", val: cta, set: setCta, ph: "Ex: Salvar o vídeo / Mandar mensagem no Direct", rows: 1 }
  ];

  return React.createElement("div", { style: { fontFamily: "'Inter','Segoe UI',Arial,sans-serif", background: "#0A0A12", minHeight: "100vh", color: "#E8E4F0" } },

    React.createElement("div", { style: { background: "linear-gradient(135deg,#160820 0%,#0A0A18 100%)", borderBottom: "1px solid #B8863C35", padding: "28px 24px 22px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 36, marginBottom: 6 } }, "🌙"),
      React.createElement("h1", { style: { margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: 5, color: "#B8863C", fontFamily: "Georgia,serif" } }, "LUNA"),
      React.createElement("p", { style: { margin: "4px 0 0", fontSize: 11, color: "#666", letterSpacing: 3, textTransform: "uppercase" } }, "Linguagem Unificada de Narrativas Atraentes"),
      React.createElement("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#555", fontStyle: "italic" } }, "IA de Roteiros de Reels · Metodologia DIVA · Mulheres Magnéticas")
    ),

    React.createElement("div", { style: { maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" } },

      !roteiro ? React.createElement("div", null,

        React.createElement("div", { style: { marginBottom: 28 } },
          React.createElement("div", { style: { fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" } }, "Escolha o tipo de conteúdo DIVA *"),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
            Object.entries(DIVA_CONFIG).map(function(entry) {
              var key = entry[0];
              var cfg = entry[1];
              return React.createElement("button", {
                key: key,
                onClick: function() { setTipo(key); },
                style: {
                  padding: "14px 16px",
                  border: "2px solid " + (tipo === key ? cfg.border : "#1E1E2E"),
                  borderRadius: 12,
                  background: tipo === key ? cfg.border + "22" : "#10101A",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }
              },
                React.createElement("div", { style: { fontSize: 20, marginBottom: 5 } }, cfg.emoji),
                React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: tipo === key ? cfg.border : "#9090B0" } }, cfg.label),
                React.createElement("div", { style: { fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.4 } }, cfg.desc)
              );
            })
          )
        ),

        campos.map(function(c) {
          return React.createElement("div", { key: c.key, style: { marginBottom: 18 } },
            React.createElement("label", { style: { display: "block", fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" } }, c.label + " *"),
            React.createElement("textarea", {
              value: c.val,
              onChange: function(e) { c.set(e.target.value); },
              placeholder: c.ph,
              rows: c.rows,
              style: {
                width: "100%", padding: "12px 14px", background: "#10101A",
                border: "1px solid " + (c.val ? "#B8863C50" : "#1E1E2E"), borderRadius: 10,
                color: "#E0DCF0", fontSize: 14, resize: "vertical", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6
              }
            })
          );
        }),

        divaAtual ? React.createElement("div", { style: { padding: "14px 18px", background: divaAtual.border + "12", border: "1px solid " + divaAtual.border + "35", borderRadius: 10, marginBottom: 24 } },
          React.createElement("div", { style: { fontSize: 11, color: divaAtual.border, fontWeight: 800, marginBottom: 6, letterSpacing: 1 } }, divaAtual.emoji + " " + divaAtual.label.toUpperCase() + " — O QUE LUNA VAI CRIAR"),
          React.createElement("div", { style: { fontSize: 12, color: "#777", lineHeight: 1.6 } }, DIVA_DESC[tipo])
        ) : null,

        error ? React.createElement("div", { style: { padding: 14, background: "#200A12", border: "1px solid #6B1535", borderRadius: 10, color: "#D08080", fontSize: 13, marginBottom: 16 } }, error) : null,

        React.createElement("button", {
          onClick: gerarRoteiro,
          disabled: !canGenerate || loading,
          style: {
            width: "100%", padding: "16px", borderRadius: 12, border: "none",
            background: canGenerate && !loading ?
