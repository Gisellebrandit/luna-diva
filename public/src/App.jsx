import { useState } from "react";

const LUNA_SYSTEM_PROMPT = `Você se chama LUNA — Linguagem Unificada de Narrativas Atraentes.
Você é uma especialista em criação de roteiros de Reels para empreendedoras, treinada na metodologia DIVA do programa Mulheres Magnéticas.

Sua personalidade:
- Direta, estratégica e sem rodeios
- Empática com as dores reais de empreendedoras
- Tom de conversa entre mulheres que se respeitam
- Confiante sem arrogância, magnética sem artificialismo
- Nunca genérica — sempre específica ao nicho e à persona

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OS 4 FRAMEWORKS DIVA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

D — DESIGUALTURA
Objetivo: parar o scroll por fricção cognitiva.
Estrutura: GANCHO (afirmação contraintuitiva, máx 12 palavras, nunca comece com Oi/Olá/apresentação) → TRANSIÇÃO (acolhimento, desativa defensividade, máx 2 frases) → REENQUADRAMENTO (perspectiva nova com exemplo do nicho, 3-5 frases) → CTA (único, magnético, não desesperado)

I — INSPIRAÇÃO
Objetivo: criar identificação emocional profunda.
Estrutura: PONTE EMOCIONAL (começa onde a persona está, tom "eu te vejo") → VIRADA (novo ângulo, sem clichê, sem "você consegue") → CHAMADO GENTIL (pergunta ou reflexão, NÃO é CTA de venda)

V — VENDA
Objetivo: ativar o desejo pelo resultado e direcionar para a oferta.
Estrutura: GANCHO DE DOR (problema específico que a persona conhece) → PONTE DA POSSIBILIDADE (estado desejado, tom de possibilidade não de promessa exagerada) → PROVA OU MECANISMO (razão concreta para acreditar) → OFERTA + CTA (claro, direto, tom de abundância)

A — AUTORIDADE
Objetivo: estabelecer credibilidade que facilita a compra futura.
Estrutura: GANCHO DE VALOR (promete conhecimento específico, usa número ou estrutura clara) → DESENVOLVIMENTO (entrega profunda, específica ao nicho) → INSIGHT EXCLUSIVO (ângulo que só especialista daria) → CTA DE RELACIONAMENTO (salvar, comentar, compartilhar — não venda)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE OUTPUT OBRIGATÓRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sempre gere o roteiro neste formato exato:

🎬 ROTEIRO LUNA — [TIPO] | [TEMA]
📍 Nicho: [nicho] | Persona: [persona]
⏱ Duração estimada: [X a Y segundos]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[GANCHO — primeiros 3 segundos]
[texto]

[DESENVOLVIMENTO]
[texto]

[FECHAMENTO + CTA]
[texto]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 NOTAS DE PRODUÇÃO
- Legenda sobreposta: "[texto]"
- Tom de voz: [orientação]
- Trilha: [sugestão]

RESTRIÇÕES — NUNCA:
- Começa com "Oi gente" ou apresentação pessoal
- Gera conteúdo genérico que serve para qualquer nicho
- Usa mais de um CTA por roteiro
- Cria conteúdo desesperado ou súplica
- Usa clichês motivacionais vazios
- Ultrapassa 90 segundos estimados
- Mistura dois tipos DIVA no mesmo roteiro

Se o input estiver incompleto, pergunte especificamente o que falta antes de gerar.`;

const DIVA_CONFIG = {
  D: { label: "D — Desigualtura", emoji: "⚡", desc: "Provoca, quebra crenças, para o scroll", color: "#6B1535", light: "#FBF0F3", border: "#B8863C" },
  I: { label: "I — Inspiração", emoji: "💜", desc: "Conexão emocional profunda, identificação", color: "#6B4A8A", light: "#F3EFF8", border: "#6B4A8A" },
  V: { label: "V — Venda", emoji: "💰", desc: "Transforma desejo em ação, converte", color: "#1A6B6B", light: "#EBF5F5", border: "#1A6B6B" },
  A: { label: "A — Autoridade", emoji: "🎓", desc: "Credibilidade, expertise, confiança", color: "#2C3E7A", light: "#EEF0FA", border: "#2C3E7A" }
};

export default function Luna() {
  const [tipo, setTipo] = useState("");
  const [nicho, setNicho] = useState("");
  const [persona, setPersona] = useState("");
  const [tema, setTema] = useState("");
  const [cta, setCta] = useState("");
  const [roteiro, setRoteiro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [chat, setChat] = useState([]);
  const [refinamento, setRefinamento] = useState("");

  const canGenerate = tipo && nicho && persona && tema && cta;
  const divaAtual = tipo ? DIVA_CONFIG[tipo] : null;

  async function gerarRoteiro() {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setRoteiro("");

    const userMessage = `Tipo DIVA: ${tipo}\nNicho: ${nicho}\nPersona: ${persona}\nTema do Reel: ${tema}\nObjetivo do CTA: ${cta}`;
    const messages = [...chat, { role: "user", content: userMessage }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
          messages
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setRoteiro(text);
      setChat([...messages, { role: "assistant", content: text }]);
    } catch (e) {
      setError("Erro ao conectar com LUNA. Tente novamente.");
    }
    setLoading(false);
  }

  async function refinarRoteiro(instrucao) {
    if (!instrucao.trim() || loading) return;
    setLoading(true);
    setError("");
    const messages = [...chat, { role: "user", content: instrucao }];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
          messages
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setRoteiro(text);
      setChat([...messages, { role: "assistant", content: text }]);
      setRefinamento("");
    } catch (e) {
      setError("Erro ao refinar. Tente novamente.");
    }
    setLoading(false);
  }

  function copiar() {
    navigator.clipboard.writeText(roteiro);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function novo() {
    setRoteiro(""); setChat([]); setTipo(""); setNicho(""); setPersona("");
    setTema(""); setCta(""); setError(""); setRefinamento("");
  }

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", background: "#0A0A12", minHeight: "100vh", color: "#E8E4F0" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#160820 0%,#0A0A18 100%)", borderBottom: "1px solid #B8863C35", padding: "28px 24px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🌙</div>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: 5, color: "#B8863C", fontFamily: "Georgia,serif" }}>LUNA</h1>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666", letterSpacing: 3, textTransform: "uppercase" }}>Linguagem Unificada de Narrativas Atraentes</p>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#555", fontStyle: "italic" }}>IA de Roteiros de Reels · Metodologia DIVA · Mulheres Magnéticas</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>

        {!roteiro ? (
          <>
            {/* TIPO DIVA */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
                Escolha o tipo de conteúdo DIVA *
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(DIVA_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setTipo(key)} style={{
                    padding: "14px 16px",
                    border: `2px solid ${tipo === key ? cfg.border : "#1E1E2E"}`,
                    borderRadius: 12,
                    background: tipo === key ? `${cfg.border}15` : "#10101A",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{cfg.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: tipo === key ? cfg.border : "#9090B0" }}>{cfg.label}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.4 }}>{cfg.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CAMPOS */}
            {[
              { label: "Seu nicho", key: "nicho", val: nicho, set: setNicho, ph: "Ex: Esteticista em SP especializada em rejuvenescimento facial", rows: 2 },
              { label: "Persona — quem vai assistir", key: "persona", val: persona, set: setPersona, ph: "Ex: Mulheres 35-50 anos, querem resultado sem cirurgia, já tentaram cremes caros", rows: 2 },
              { label: "Tema do Reel", key: "tema", val: tema, set: setTema, ph: "Ex: Por que o skincare caseiro pode estar envelhecendo sua pele", rows: 2 },
              { label: "Objetivo do CTA", key: "cta", val: cta, set: setCta, ph: "Ex: Salvar o vídeo / Mandar mensagem no Direct", rows: 1 },
            ].map(({ label, key, val, set, ph, rows }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 3, color: "#B8863C", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>
                  {label} *
                </label>
                <textarea
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={ph}
                  rows={rows}
                  style={{
                    width: "100%", padding: "12px 14px", background: "#10101A",
                    border: `1px solid ${val ? "#B8863C50" : "#1E1E2E"}`, borderRadius: 10,
                    color: "#E0DCF0", fontSize: 14, resize: "vertical", outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6,
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            ))}

            {/* INFO DO TIPO */}
            {divaAtual && (
              <div style={{ padding: "14px 18px", background: `${divaAtual.border}12`, border: `1px solid ${divaAtual.border}35`, borderRadius: 10, marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: divaAtual.border, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>
                  {divaAtual.emoji} {divaAtual.label.toUpperCase()} — O QUE LUNA VAI CRIAR
                </div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>
                  {tipo === "D" && "Um gancho que quebra uma crença da sua persona → acolhimento que desativa a defensividade → reposicionamento com perspectiva nova e CTA magnético."}
                  {tipo === "I" && "Um conteúdo que começa exatamente onde sua persona está emocionalmente, oferece um novo ângulo sem clichê, e termina com um convite interno — não uma venda."}
                  {tipo === "V" && "Nomeia a dor que a persona conhece de dentro, mostra a transformação possível, apresenta uma razão concreta para acreditar e direciona para a oferta sem desespero."}
                  {tipo === "A" && "Promete e entrega conhecimento específico e útil, com profundidade real, um insight exclusivo que só especialista daria, e CTA de relacionamento — não de venda."}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: 14, background: "#200A12", border: "1px solid #6B1535", borderRadius: 10, color: "#D08080", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={gerarRoteiro}
              disabled={!canGenerate || loading}
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: canGenerate && !loading ? "linear-gradient(135deg,#6B1535,#B8863C)" : "#1A1A2A",
                color: canGenerate && !loading ? "#FFF" : "#444",
                fontSize: 15, fontWeight: 800, cursor: canGenerate && !loading ? "pointer" : "not-allowed",
                letterSpacing: 1.5, transition: "all 0.2s",
              }}>
              {loading ? "🌙 LUNA está criando seu roteiro..." : "✨ GERAR ROTEIRO COM LUNA"}
            </button>

            {!canGenerate && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#444", marginTop: 10 }}>
                Preencha todos os campos para ativar LUNA
              </p>
            )}
          </>
        ) : (
          <>
            {/* HEADER DO RESULTADO */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#B8863C", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>Roteiro gerado por LUNA</div>
                {divaAtual && <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{divaAtual.emoji} {divaAtual.label} · {nicho}</div>}
              </div>
              <button onClick={novo} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #1E1E2E", borderRadius: 8, color: "#666", fontSize: 12, cursor: "pointer" }}>
                + Novo
              </button>
            </div>

            {/* ROTEIRO */}
            <div style={{
              background: "#10101A", border: "1px solid #B8863C35", borderRadius: 14,
              padding: "24px 22px", fontSize: 14, lineHeight: 1.8, color: "#D8D4E8",
              whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace",
              marginBottom: 16, maxHeight: 500, overflowY: "auto",
            }}>
              {roteiro}
            </div>

            {/* AÇÕES */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button onClick={copiar} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                border: `1px solid ${copied ? "#2A7A4A" : "#B8863C50"}`,
                background: copied ? "#0A2A1A" : "#10101A",
                color: copied ? "#4ABA6A" : "#B8863C",
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              }}>
                {copied ? "✅ Copiado!" : "📋 Copiar roteiro"}
              </button>
              <button onClick={novo} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #1E1E2E",
                background: "#10101A", color: "#666", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                🔄 Novo roteiro
              </button>
            </div>

            {/* REFINAMENTO */}
            <div style={{ background: "#0C0C18", border: "1px solid #1E1E2E", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 10, color: "#B8863C", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
                🔧 Refinar com LUNA
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {[
                  "Reescreva o gancho — mais provocador",
                  "Tom ficou genérico — adapte ao nicho",
                  "Crie 3 versões do gancho",
                  "CTA fraco — reescreva com urgência real",
                  "Adapte para legenda de post",
                  "Versão mais curta — 30 segundos",
                ].map(s => (
                  <button key={s} onClick={() => setRefinamento(s)} style={{
                    padding: "7px 12px",
                    background: refinamento === s ? "#1E1A2E" : "#10101A",
                    border: `1px solid ${refinamento === s ? "#6B4A8A" : "#1E1E2E"}`,
                    borderRadius: 8,
                    color: refinamento === s ? "#9B7AC0" : "#666",
                    fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={refinamento}
                  onChange={e => setRefinamento(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && refinarRoteiro(refinamento)}
                  placeholder="Ou escreva sua instrução para LUNA..."
                  style={{
                    flex: 1, padding: "10px 14px", background: "#10101A",
                    border: "1px solid #1E1E2E", borderRadius: 8, color: "#E0DCF0",
                    fontSize: 13, outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={() => refinarRoteiro(refinamento)}
                  disabled={!refinamento.trim() || loading}
                  style={{
                    padding: "10px 20px", borderRadius: 8, border: "none",
                    background: refinamento.trim() && !loading ? "#6B1535" : "#1A1A2A",
                    color: refinamento.trim() && !loading ? "#FFF" : "#444",
                    fontSize: 13, fontWeight: 700,
                    cursor: refinamento.trim() && !loading ? "pointer" : "not-allowed",
                  }}>
                  {loading ? "..." : "Refinar"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: 14, background: "#200A12", border: "1px solid #6B1535", borderRadius: 10, color: "#D08080", fontSize: 13, marginTop: 16 }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 60, paddingTop: 24, borderTop: "1px solid #141420" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🌙</div>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, textTransform: "uppercase" }}>LUNA · Mulheres Magnéticas</div>
          <div style={{ fontSize: 10, color: "#2A2A2A", marginTop: 6, fontStyle: "italic" }}>A loba solitária morre — a alcateia sobrevive</div>
        </div>
      </div>
    </div>
  );
}
