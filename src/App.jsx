import React from "react";

var prompt = "Você se chama LUNA — Linguagem Unificada de Narrativas Atraentes. ";
prompt += "Você é especialista em roteiros de Reels treinada na metodologia DIVA do programa Mulheres Magnéticas. ";
prompt += "Personalidade: direta, empática, magnética, nunca genérica. ";
prompt += "D — DESIGUALTURA: pare o scroll com afirmação contraintuitiva (max 12 palavras). Estrutura: GANCHO provocador, TRANSIÇÃO acolhedora, REENQUADRAMENTO com exemplo do nicho, CTA único. ";
prompt += "I — INSPIRAÇÃO: identificação emocional. Estrutura: PONTE EMOCIONAL onde a persona está, VIRADA sem clichê, CHAMADO GENTIL sem venda. ";
prompt += "V — VENDA: ative o desejo. Estrutura: GANCHO DE DOR específico, PONTE DA POSSIBILIDADE, PROVA ou MECANISMO, OFERTA com CTA direto. ";
prompt += "A — AUTORIDADE: credibilidade. Estrutura: GANCHO DE VALOR com número, DESENVOLVIMENTO profundo, INSIGHT EXCLUSIVO, CTA de relacionamento. ";
prompt += "FORMATO OBRIGATÓRIO: comece com ROTEIRO LUNA — [TIPO] | [TEMA], depois Nicho e Persona, Duração estimada, depois as seções GANCHO, DESENVOLVIMENTO, FECHAMENTO+CTA e NOTAS DE PRODUÇÃO com legenda, tom e trilha. ";
prompt += "NUNCA: comece com Oi gente, seja genérico, use dois CTAs, suplique, use clichês, ultrapasse 90 segundos, misture tipos DIVA. ";
prompt += "Se faltar informação, pergunte antes de gerar.";

var divaConfig = {
  D: { label: "D — Desigualtura", emoji: "⚡", desc: "Provoca, quebra crenças, para o scroll", border: "#B8863C" },
  I: { label: "I — Inspiração", emoji: "💜", desc: "Conexão emocional profunda", border: "#6B4A8A" },
  V: { label: "V — Venda", emoji: "💰", desc: "Transforma desejo em ação", border: "#1A6B6B" },
  A: { label: "A — Autoridade", emoji: "🎓", desc: "Credibilidade e expertise", border: "#2C3E7A" }
};

var divaDesc = {
  D: "Gancho que quebra crença da persona, acolhimento que desativa defensividade, reposicionamento com perspectiva nova e CTA magnético.",
  I: "Começa onde a persona está emocionalmente, oferece novo ângulo sem clichê, termina com convite interno — não venda.",
  V: "Nomeia a dor que a persona conhece, mostra transformação possível, razão concreta para acreditar, direciona para oferta sem desespero.",
  A: "Entrega conhecimento específico com profundidade real, insight exclusivo que só especialista daria, CTA de relacionamento — não venda."
};

var sugestoes = [
  "Reescreva o gancho — mais provocador",
  "Tom ficou genérico — adapte ao nicho",
  "Crie 3 versões do gancho",
  "CTA fraco — reescreva com urgência real",
  "Adapte para legenda de post",
  "Versão mais curta — 30 segundos"
];

var estiloHeader = {
  background: "linear-gradient(135deg,#160820,#0A0A18)",
  borderBottom: "1px solid rgba(184,134,60,0.2)",
  padding: "28px 24px 22px",
  textAlign: "center"
};

var estiloContainer = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "32px 20px 80px"
};

var estiloRoteiro = {
  background: "#10101A",
  border: "1px solid rgba(184,134,60,0.2)",
  borderRadius: 14,
  padding: "24px 22px",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#D8D4E8",
  whiteSpace: "pre-wrap",
  fontFamily: "Courier New, monospace",
  marginBottom: 16,
  maxHeight: 500,
  overflowY: "auto"
};

function callApi(messages, onSuccess, onError) {
  var key = process.env.REACT_APP_ANTHROPIC_KEY;
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: prompt,
      messages: messages
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    var b = d.content && d.content.find(function(x) { return x.type === "text"; });
    onSuccess(b ? b.text : "");
  })
  .catch(function() { onError(); });
}

class Luna extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tipo: "", nicho: "", persona: "", tema: "", cta: "",
      roteiro: "", loading: false, error: "", copied: false,
      chat: [], refinamento: ""
    };
    this.gerar = this.gerar.bind(this);
    this.refinar = this.refinar.bind(this);
    this.copiar = this.copiar.bind(this);
    this.novo = this.novo.bind(this);
  }

  gerar() {
    var s = this.state;
    if (!s.tipo || !s.nicho || !s.persona || !s.tema || !s.cta) { return; }
    this.setState({ loading: true, error: "", roteiro: "" });
    var msg = "Tipo DIVA: " + s.tipo + "\nNicho: " + s.nicho + "\nPersona: " + s.persona + "\nTema: " + s.tema + "\nCTA: " + s.cta;
    var messages = s.chat.concat([{ role: "user", content: msg }]);
    var self = this;
    callApi(messages, function(text) {
      self.setState({ roteiro: text, chat: messages.concat([{ role: "assistant", content: text }]), loading: false });
    }, function() {
      self.setState({ error: "Erro ao conectar com LUNA. Tente novamente.", loading: false });
    });
  }

  refinar() {
    var s = this.state;
    if (!s.refinamento || !s.refinamento.trim() || s.loading) { return; }
    this.setState({ loading: true, error: "" });
    var messages = s.chat.concat([{ role: "user", content: s.refinamento }]);
    var self = this;
    callApi(messages, function(text) {
      self.setState({ roteiro: text, chat: messages.concat([{ role: "assistant", content: text }]), refinamento: "", loading: false });
    }, function() {
      self.setState({ error: "Erro ao refinar. Tente novamente.", loading: false });
    });
  }

  copiar() {
    var self = this;
    navigator.clipboard.writeText(this.state.roteiro);
    this.setState({ copied: true });
    setTimeout(function() { self.setState({ copied: false }); }, 2000);
  }

  novo() {
    this.setState({ tipo: "", nicho: "", persona: "", tema: "", cta: "", roteiro: "", error: "", chat: [], refinamento: "" });
  }

  renderFormulario() {
    var s = this.state;
    var self = this;
    var canGenerate = s.tipo && s.nicho && s.persona && s.tema && s.cta;
    var divaAtual = s.tipo ? divaConfig[s.tipo] : null;
    var btnBg = canGenerate && !s.loading ? "linear-gradient(135deg,#6B1535,#B8863C)" : "#1A1A2A";
    var btnColor = canGenerate && !s.loading ? "#FFF" : "#444";
    var btnCursor = canGenerate && !s.loading ? "pointer" : "not-allowed";

    var campos = [
      { label: "SEU NICHO *", val: s.nicho, set: function(v) { self.setState({ nicho: v }); }, ph: "Ex: Esteticista em SP especializada em rejuvenescimento facial" },
      { label: "PERSONA — QUEM VAI ASSISTIR *", val: s.persona, set: function(v) { self.setState({ persona: v }); }, ph: "Ex: Mulheres 35-50 anos, querem resultado sem cirurgia" },
      { label: "TEMA DO REEL *", val: s.tema, set: function(v) { self.setState({ tema: v }); }, ph: "Ex: Por que o skincare caseiro pode envelhecer sua pele" },
      { label: "OBJETIVO DO CTA *", val: s.cta, set: function(v) { self.setState({ cta: v }); }, ph: "Ex: Salvar o vídeo / Mandar mensagem no Direct" }
    ];

    return React.createElement("div", null,
      React.createElement("div", { style: { marginBottom: 28 } },
        React.createElement("div", { style: { fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" } }, "Escolha o tipo de conteúdo DIVA *"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
          Object.keys(divaConfig).map(function(key) {
            var cfg = divaConfig[key];
            var isSelected = s.tipo === key;
            return React.createElement("button", {
              key: key,
              onClick: function() { self.setState({ tipo: key }); },
              style: {
                padding: "14px 16px",
                border: "2px solid " + (isSelected ? cfg.border : "#1E1E2E"),
                borderRadius: 12,
                background: isSelected ? cfg.border + "22" : "#10101A",
                cursor: "pointer",
                textAlign: "left"
              }
            },
              React.createElement("div", { style: { fontSize: 20, marginBottom: 5 } }, cfg.emoji),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: isSelected ? cfg.border : "#9090B0" } }, cfg.label),
              React.createElement("div", { style: { fontSize: 11, color: "#555", marginTop: 3 } }, cfg.desc)
            );
          })
        )
      ),

      campos.map(function(c, i) {
        return React.createElement("div", { key: i, style: { marginBottom: 18 } },
          React.createElement("label", { style: { display: "block", fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 8 } }, c.label),
          React.createElement("textarea", {
            value: c.val,
            rows: 2,
            onChange: function(e) { c.set(e.target.value); },
            placeholder: c.ph,
            style: {
              width: "100%", padding: "12px 14px", background: "#10101A",
              border: "1px solid " + (c.val ? "rgba(184,134,60,0.3)" : "#1E1E2E"),
              borderRadius: 10, color: "#E0DCF0", fontSize: 14,
              resize: "vertical", outline: "none", fontFamily: "inherit",
              boxSizing: "border-box", lineHeight: 1.6
            }
          })
        );
      }),

      divaAtual ? React.createElement("div", { style: { padding: "14px 18px", background: divaAtual.border + "12", border: "1px solid " + divaAtual.border + "35", borderRadius: 10, marginBottom: 24 } },
        React.createElement("div", { style: { fontSize: 11, color: divaAtual.border, fontWeight: 800, marginBottom: 6 } }, divaAtual.emoji + " " + divaAtual.label.toUpperCase() + " — O QUE LUNA VAI CRIAR"),
        React.createElement("div", { style: { fontSize: 12, color: "#777", lineHeight: 1.6 } }, divaDesc[s.tipo])
      ) : null,

      s.error ? React.createElement("div", { style: { padding: 14, background: "#200A12", border: "1px solid #6B1535", borderRadius: 10, color: "#D08080", fontSize: 13, marginBottom: 16 } }, s.error) : null,

      React.createElement("button", {
        onClick: this.gerar,
        disabled: !canGenerate || s.loading,
        style: { width: "100%", padding: "16px", borderRadius: 12, border: "none", background: btnBg, color: btnColor, fontSize: 15, fontWeight: 800, cursor: btnCursor, letterSpacing: 1.5 }
      }, s.loading ? "🌙 LUNA está criando seu roteiro..." : "✨ GERAR ROTEIRO COM LUNA"),

      !canGenerate ? React.createElement("p", { style: { textAlign: "center", fontSize: 12, color: "#444", marginTop: 10 } }, "Preencha todos os campos para ativar LUNA") : null
    );
  }

  renderRoteiro() {
    var s = this.state;
    var self = this;
    var divaAtual = s.tipo ? divaConfig[s.tipo] : null;
    var btnCopiarBg = s.copied ? "#0A2A1A" : "#10101A";
    var btnCopiarBorder = s.copied ? "#2A7A4A" : "rgba(184,134,60,0.3)";
    var btnCopiarColor = s.copied ? "#4ABA6A" : "#B8863C";
    var btnRefinarBg = s.refinamento.trim() && !s.loading ? "#6B1535" : "#1A1A2A";
    var btnRefinarColor = s.refinamento.trim() && !s.loading ? "#FFF" : "#444";
    var btnRefinarCursor = s.refinamento.trim() && !s.loading ? "pointer" : "not-allowed";

    return React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 10, color: "#B8863C", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" } }, "Roteiro gerado por LUNA"),
          divaAtual ? React.createElement("div", { style: { fontSize: 12, color: "#555", marginTop: 4 } }, divaAtual.emoji + " " + divaAtual.label + " · " + s.nicho) : null
        ),
        React.createElement("button", { onClick: this.novo, style: { padding: "6px 14px", background: "transparent", border: "1px solid #1E1E2E", borderRadius: 8, color: "#666", fontSize: 12, cursor: "pointer" } }, "+ Novo")
      ),

      React.createElement("div", { style: estiloRoteiro }, s.roteiro),

      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 24 } },
        React.createElement("button", { onClick: this.copiar, style: { flex: 1, padding: "12px", borderRadius: 10, border: "1px solid " + btnCopiarBorder, background: btnCopiarBg, color: btnCopiarColor, fontSize: 13, fontWeight: 700, cursor: "pointer" } }, s.copied ? "✅ Copiado!" : "📋 Copiar roteiro"),
        React.createElement("button", { onClick: this.novo, style: { flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #1E1E2E", background: "#10101A", color: "#666", fontSize: 13, fontWeight: 700, cursor: "pointer" } }, "🔄 Novo roteiro")
      ),

      React.createElement("div", { style: { background: "#0C0C18", border: "1px solid #1E1E2E", borderRadius: 14, padding: 20 } },
        React.createElement("div", { style: { fontSize: 10, color: "#B8863C", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 } }, "🔧 Refinar com LUNA"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 } },
          sugestoes.map(function(sg) {
            var isSelected = s.refinamento === sg;
            return React.createElement("button", {
              key: sg,
              onClick: function() { self.setState({ refinamento: sg }); },
              style: {
                padding: "7px 12px",
                background: isSelected ? "#1E1A2E" : "#10101A",
                border: "1px solid " + (isSelected ? "#6B4A8A" : "#1E1E2E"),
                borderRadius: 8, color: isSelected ? "#9B7AC0" : "#666",
                fontSize: 11, cursor: "pointer"
              }
            }, sg);
          })
        ),
        React.createElement("div", { style: { display: "flex", gap: 10 } },
          React.createElement("input", {
            value: s.refinamento,
            onChange: function(e) { self.setState({ refinamento: e.target.value }); },
            onKeyDown: function(e) { if (e.key === "Enter") { self.refinar(); } },
            placeholder: "Ou escreva sua instrução para LUNA...",
            style: { flex: 1, padding: "10px 14px", background: "#10101A", border: "1px solid #1E1E2E", borderRadius: 8, color: "#E0DCF0", fontSize: 13, outline: "none", fontFamily: "inherit" }
          }),
          React.createElement("button", {
            onClick: this.refinar,
            disabled: !s.refinamento.trim() || s.loading,
            style: { padding: "10px 20px", borderRadius: 8, border: "none", background: btnRefinarBg, color: btnRefinarColor, fontSize: 13, fontWeight: 700, cursor: btnRefinarCursor }
          }, s.loading ? "..." : "Refinar")
        )
      ),

      s.error ? React.createElement("div", { style: { padding: 14, background: "#200A12", border: "1px solid #6B1535", borderRadius: 10, color: "#D08080", fontSize: 13, marginTop: 16 } }, s.error) : null
    );
  }

  render() {
    var s = this.state;
    return React.createElement("div", { style: { fontFamily: "Inter,Segoe UI,Arial,sans-serif", background: "#0A0A12", minHeight: "100vh", color: "#E8E4F0" } },
      React.createElement("div", { style: estiloHeader },
        React.createElement("div", { style: { fontSize: 36, marginBottom: 6 } }, "🌙"),
        React.createElement("h1", { style: { margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: 5, color: "#B8863C", fontFamily: "Georgia,serif" } }, "LUNA"),
        React.createElement("p", { style: { margin: "4px 0 0", fontSize: 11, color: "#666", letterSpacing: 3, textTransform: "uppercase" } }, "Linguagem Unificada de Narrativas Atraentes"),
        React.createElement("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#555", fontStyle: "italic" } }, "IA de Roteiros de Reels · Metodologia DIVA · Mulheres Magnéticas")
      ),
      React.createElement("div", { style: estiloContainer },
        !s.roteiro ? this.renderFormulario() : this.renderRoteiro(),
        React.createElement("div", { style: { textAlign: "center", marginTop: 60, paddingTop: 24, borderTop: "1px solid #141420" } },
          React.createElement("div", { style: { fontSize: 20, marginBottom: 6 } }, "🌙"),
          React.createElement("div", { style: { fontSize: 10, color: "#333", letterSpacing: 3, textTransform: "uppercase" } }, "LUNA · Mulheres Magnéticas"),
          React.createElement("div", { style: { fontSize: 10, color: "#2A2A2A", marginTop: 6, fontStyle: "italic" } }, "A loba solitária morre — a alcateia sobrevive")
        )
      )
    );
  }
}

export default Luna;
