import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FormPage from './pages/FormPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';
import ETPResultPage from './pages/ETPResultPage';
import TRResultPage from './pages/TRResultPage';
import type { DemandaInput, DODResponse, DODApiResponse, ETPInput, ETPResponse, TRInput, TRResponse, LogEntry, FieldSelection, ArcaSessionData } from './types';
import { submitDemanda } from './api/dodService';
import { submitETP } from './api/etpService';
import { submitTR } from './api/trService';
import { submitStandardExtraction } from './api/standardService';
import { generateId, getSelectedValue } from './utils/helpers';
import { fetchArcaSession } from './api/arcaService';
import { setApiEnvironment } from './api/dodService';
import DocumentNavBar from './components/layout/DocumentNavBar';
import type { CurrentDocument } from './components/layout/DocumentNavBar';
import './styles/global.css';

type AppScreen = 'form' | 'loading' | 'result' | 'etp-loading' | 'etp-result' | 'tr-loading' | 'tr-result';

type DocStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Componente raiz da aplicação.
 * Gerencia o fluxo entre Formulário → Carregamento DOD → Resultado DOD → Carregamento ETP → Resultado ETP.
 */
export default function App() {
  const [screen, setScreen] = useState<AppScreen>('form');
  const [activeTab, setActiveTab] = useState<CurrentDocument>('DOD');

  // Status de carregamento individuais
  const [dodStatus, setDodStatus] = useState<DocStatus>('idle');
  const [etpStatus, setEtpStatus] = useState<DocStatus>('idle');
  const [trStatus, setTrStatus] = useState<DocStatus>('idle');

  // Logs individuais
  const [dodLogs, setDodLogs] = useState<LogEntry[]>([]);
  const [etpLogs, setEtpLogs] = useState<LogEntry[]>([]);
  const [trLogs, setTrLogs] = useState<LogEntry[]>([]);

  const [dodResponse, setDodResponse] = useState<DODResponse | null>(null);
  const [etpResponse, setEtpResponse] = useState<ETPResponse | null>(null);
  const [trResponse, setTrResponse] = useState<TRResponse | null>(null);
  const [formData, setFormData] = useState<DemandaInput | null>(null);

  /** trace_id retornado pela API (habilita avaliação humana) */
  const [dodTraceId, setDodTraceId] = useState<string | null>(null);
  const [etpTraceId, setEtpTraceId] = useState<string | null>(null);
  const [trTraceId, setTrTraceId] = useState<string | null>(null);

  // Store intermediate inputs
  const [etpInputData, setEtpInputData] = useState<ETPInput | null>(null);

  // Flag if the process went via fast-track Standard Extraction
  const [isStandardMode, setIsStandardMode] = useState<boolean>(false);

  const arcaProcessedRef = useRef(false);

  /** Adiciona uma entrada ao console de logs de um documento específico */
  const addLog = useCallback(
    (message: string, doc: CurrentDocument, type: LogEntry['type'] = 'info') => {
      const newEntry = {
        id: generateId(),
        timestamp: new Date(),
        message,
        type,
      };

      if (doc === 'DOD') setDodLogs((prev) => [...prev, newEntry]);
      if (doc === 'ETP') setEtpLogs((prev) => [...prev, newEntry]);
      if (doc === 'TR') setTrLogs((prev) => [...prev, newEntry]);
    },
    []
  );

  /** Callback do formulário Nova Demanda → dispara a requisição DOD (Fluxo RAG) */
  const handleFormSubmit = useCallback(
    async (data: DemandaInput, metadata?: { user_name: string; user_id: string }) => {
      setIsStandardMode(false);
      setFormData(data);
      setScreen('result');
      setActiveTab('DOD');
      setDodStatus('loading');
      setDodLogs([]);

      const sourceLabel = metadata ? 'integração ARCA' : 'modelo RAG';
      addLog(`Iniciando processo de geração de sugestões do DOD via ${sourceLabel}...`, 'DOD', 'info');

      try {
        addLog(`Demanda: ${data.demanda_unidade} | PCA: ${data.pca}`, 'DOD', 'info');
        if (metadata) {
          addLog(`Usuário ARCA: ${metadata.user_name} (${metadata.user_id})`, 'DOD', 'info');
        }

        const result: DODApiResponse = await submitDemanda(
          data,
          (msg, type) => addLog(msg, 'DOD', type),
          metadata,
        );

        addLog('Todas as sugestões do DOD foram recebidas com sucesso!', 'DOD', 'success');
        setDodTraceId(result.trace_id);
        setDodResponse(result.texto_gerado);
        setDodStatus('success');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'DOD', 'error');
        addLog('Verifique a conexão com a API e tente novamente.', 'DOD', 'warning');
        setDodStatus('error');
      }
    },
    [addLog]
  );

  /**
   * Deep-Link ARCA: detecta ?token= na URL, busca sessão no backend,
   * pula FormPage e dispara handleFormSubmit automaticamente.
   */
  useEffect(() => {
    if (arcaProcessedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    arcaProcessedRef.current = true;

    // Limpar URL imediatamente
    window.history.replaceState({}, '', window.location.pathname);

    (async () => {
      try {
        const sessionData: ArcaSessionData = await fetchArcaSession(token);

        // Definir ambiente antes de disparar o fluxo
        setApiEnvironment(sessionData.ambiente);

        // Armazenar metadados do usuário ARCA
        const metadata = {
          user_name: sessionData.user_name,
          user_id: sessionData.user_id,
        };

        // Montar DemandaInput a partir dos dados da sessão
        const data: DemandaInput = {
          pca: sessionData.pca,
          demanda_unidade: sessionData.demanda_unidade,
          grau_prioridade: sessionData.grau_prioridade,
          justificativa: sessionData.justificativa,
          valor_estimado: sessionData.valor_estimado,
          modelo: sessionData.modelo,
          data_prevista: sessionData.data_prevista,
          investimento_custeio: sessionData.investimento_custeio,
        };

        // Disparar fluxo direto (pula FormPage)
        handleFormSubmit(data, metadata);
      } catch (error) {
        console.error('Falha ao carregar sessão ARCA:', error);
        // Fallback: exibir FormPage normal
      }
    })();
  }, [handleFormSubmit]);

  /** Callback do formulário Contratação Repetida → dispara a requisição Fast-Track */
  const handleStandardSubmit = useCallback(
    async (files: { dod: File; etp: File; tr: File }) => {
      setIsStandardMode(true);
      setScreen('result');
      setActiveTab('DOD');
      
      // All three are processing simultaneously
      setDodStatus('loading');
      setEtpStatus('loading');
      setTrStatus('loading');
      
      setDodLogs([]);
      setEtpLogs([]);
      setTrLogs([]);

      // We share the logs across all three to provide equivalent loading experience 
      // (though the user will likely just watch DOD)
      const broadcastLog = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
          addLog(msg, 'DOD', type);
          addLog(msg, 'ETP', type);
          addLog(msg, 'TR', type);
      };

      try {
        broadcastLog('Iniciando extração e estruturação em lote via Inteligência Artificial...', 'info');

        const result = await submitStandardExtraction(files, broadcastLog);

        broadcastLog('Todos os documentos foram estruturados com sucesso!', 'success');
        
        // Populate all responses at once
        setDodResponse(result.dod);
        setEtpResponse(result.etp);
        setTrResponse(result.tr);

        // Standard process doesn't currently generate trace_ids for the evaluation module
        setDodTraceId(null);
        setEtpTraceId(null);
        setTrTraceId(null);

        // Mark all as successful so they are accessible in the UI immediately
        setDodStatus('success');
        setEtpStatus('success');
        setTrStatus('success');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        broadcastLog(`Falha na extração de padrão: ${errorMsg}`, 'error');
        setDodStatus('error');
        setEtpStatus('error');
        setTrStatus('error');
      }
    },
    [addLog]
  );

  /** 
   * Callback "Confirmar Edição" do DOD → dispara requisição ETP 
   * (Apenas no fluxo RAG)
   */
  const handleConfirmDODEditing = useCallback(
    async (selections: Record<string, FieldSelection>) => {
      if (!dodResponse || !formData) return;

      setEtpStatus('loading');
      setEtpLogs([]);
      setActiveTab('ETP'); 
      addLog('Preparando dados do DOD editado para geração do ETP...', 'ETP', 'info');

      try {
        const getVal = (key: string): string[] => {
          let suggestions: string[] = [];

          // Se for um subcampo do Planejamento Estratégico, tentamos usar o campo agregado
          if (key.startsWith('planejamento_estrategico.')) {
            const subKey = key.split('.')[1];
            suggestions = ((dodResponse.planejamento_estrategico as unknown) as Record<string, string[]>)[subKey] || [];
            
            const aggregatedSelection = selections['planejamento_estrategico'];
            if (aggregatedSelection) {
              // Se houver edição manual no campo agregado, enviamos o texto todo para cada campo (ou apenas para o primeiro)
              // Aqui optamos por enviar para todos para garantir que a informação chegue ao backend
              if (aggregatedSelection.isEditing && aggregatedSelection.customValue) {
                return [aggregatedSelection.customValue];
              }
              // Se não houver edição, usamos o índice selecionado no campo agregado para pegar a sugestão original do subcampo
              return [suggestions[aggregatedSelection.selectedIndex] || ''];
            }
          } else {
            suggestions = ((dodResponse as unknown) as Record<string, string[]>)[key] || [];
          }

          const selected = getSelectedValue(key, suggestions, selections);
          return [selected];
        };

        const etpInput: ETPInput = {
          ...formData,
          nome_projeto: getVal('nome_projeto'),
          data_envio: getVal('data_envio'),
          identificacao_pca: getVal('identificacao_pca'),
          alinhamento_loa: getVal('alinhamento_loa'),
          motivacao_justificativa: getVal('motivacao_justificativa'),
          resultados_beneficios: getVal('resultados_beneficios'),
          planejamento_estrategico: {
            plano_gestao: getVal('planejamento_estrategico.plano_gestao'),
            plano_anual_contratacoes: getVal('planejamento_estrategico.plano_anual_contratacoes'),
            pdtic: getVal('planejamento_estrategico.pdtic'),
            entic_jud: getVal('planejamento_estrategico.entic_jud'),
          },
        };

        setEtpInputData(etpInput);
        addLog(`Enviando DOD editado para geração do ETP...`, 'ETP', 'info');

        const result = await submitETP(etpInput, (msg, type) => addLog(msg, 'ETP', type));

        addLog('Todas as sugestões do ETP foram recebidas com sucesso!', 'ETP', 'success');
        setEtpTraceId(result.trace_id);
        setEtpResponse(result.texto_gerado);
        setEtpStatus('success');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'ETP', 'error');
        setEtpStatus('error');
      }
    },
    [addLog, dodResponse, formData]
  );

  /** 
   * Callback "Confirmar Edição" do ETP → dispara requisição TR 
   * (Apenas no fluxo RAG)
   */
  const handleConfirmETPEditing = useCallback(
    async (selections: Record<string, FieldSelection>) => {
      if (!etpResponse || !etpInputData) return;

      setTrStatus('loading');
      setTrLogs([]);
      setActiveTab('TR');
      addLog('Preparando dados do ETP editado para geração do TR...', 'TR', 'info');

      try {
        const getVal = (key: string): any => {
          let suggestions: any[] = [];
          if (key.match(/^resp_alternativa_\d+$/)) {
            suggestions = (etpResponse.resp_avaliacao_diferentes_solucoes_disponiveis as any)?.[key]?.resp_descricao || [];
            return getSelectedValue(key, suggestions, selections);
          }
          if (['resp_periodo_analisado', 'resp_termos_analisados', 'resp_metodologia_de_calculo'].includes(key)) {
            suggestions = (etpResponse.resp_avaliacao_diferentes_solucoes_disponiveis as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }
          if (key === 'resp_motivacao_justificativa_escolha') {
            suggestions = (etpResponse.resp_justificativa_escola_solucao_de_ti as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }
          if (key === 'resp_forma_calculo_quantitativo') {
            const val = selections[key]?.customValue;
            try {
              return val ? JSON.parse(val) : [];
            } catch {
              return [];
            }
          }
          if (['resp_relacao_necessidade_volumes', 'resp_natureza_objeto', 'resp_modalidade_tipo_licitacao', 'resp_parcelamento_objeto', 'resp_vigencia_contrato'].includes(key)) {
            suggestions = (etpResponse.resp_relacao_demanda_prevista_e_quantidade as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }
          if (['resp_infraestrutura_tecnologica', 'resp_infraestrutura_eletrica', 'resp_logistica_implantacao', 'resp_espaco_fisico', 'resp_mobiliario'].includes(key)) {
            suggestions = (etpResponse.resp_necessidades_adequacao_ambiente as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }
          if (['resp_mni', 'resp_icp_brasil', 'resp_moreq_jus'].includes(key)) {
            const unifiedSelection = selections['resp_padroes_interoperabilidade'];
            suggestions = (etpResponse.resp_requisitos_padroes_interoperabilidade as any)?.[key] || [];
            
            // Se houver uma seleção no campo unificado, usamos o mesmo índice para os subcampos
            if (unifiedSelection) {
              return suggestions[unifiedSelection.selectedIndex] || suggestions[0] || '';
            }
            return getSelectedValue(key, suggestions, selections);
          }
          if (['resp_necessidade_recursos_materiais_humanos', 'resp_estrategia_continuidade', 'resp_estrategia_independencia_tjgo', 'resp_acoes_transicao'].includes(key)) {
            suggestions = (etpResponse as any)[key] || [];
            return suggestions;
          }
          suggestions = (etpResponse as any)[key] || [];
          return [getSelectedValue(key, suggestions, selections)];
        };

        const trInput: TRInput = {
          ...etpInputData,
          resp_descricao_solucao: getVal('resp_descricao_solucao'),
          resp_potenciais_usuarios: getVal('resp_potenciais_usuarios'),
          resp_requisitos_tecnologicos: getVal('resp_requisitos_tecnologicos'),
          resp_requisitos_legais: getVal('resp_requisitos_legais'),
          resp_requisitos_temporais: getVal('resp_requisitos_temporais'),
          resp_requisitos_capacitacao: getVal('resp_requisitos_capacitacao'),
          resp_requisitos_manutencao: getVal('resp_requisitos_manutencao'),
          resp_requisitos_seguranca: getVal('resp_requisitos_seguranca'),
          resp_requisitos_social_cultural_sustentabilidade: getVal('resp_requisitos_social_cultural_sustentabilidade'),
          resp_requisitos_niveis_servico: getVal('resp_requisitos_niveis_servico'),
          resp_requisitos_qualificacao_experiencia: getVal('resp_requisitos_qualificacao_experiencia'),
          resp_requisitos_formas_comunicacao: getVal('resp_requisitos_formas_comunicacao'),
          resp_outros_requisitos: getVal('resp_outros_requisitos'),
          resp_viabilidade_economica_contratacao: getVal('resp_viabilidade_economica_contratacao'),
          resp_aprovacao_assinatura_estudo_tecnico: getVal('resp_aprovacao_assinatura_estudo_tecnico'),
          resp_necessidade_recursos_materiais_humanos: getVal('resp_necessidade_recursos_materiais_humanos'),
          resp_estrategia_continuidade: getVal('resp_estrategia_continuidade'),
          resp_estrategia_independencia_tjgo: getVal('resp_estrategia_independencia_tjgo'),
          resp_acoes_transicao: getVal('resp_acoes_transicao'),
          resp_requisitos_padroes_interoperabilidade: {
            resp_mni: [getVal('resp_mni')],
            resp_icp_brasil: [getVal('resp_icp_brasil')],
            resp_moreq_jus: [getVal('resp_moreq_jus')]
          },
          resp_avaliacao_diferentes_solucoes_disponiveis: {
            resp_periodo_analisado: [getVal('resp_periodo_analisado')],
            resp_termos_analisados: [getVal('resp_termos_analisados')],
            resp_metodologia_de_calculo: [getVal('resp_metodologia_de_calculo')],
            resp_alternativa_1: { resp_descricao: [getVal('resp_alternativa_1')] },
            resp_alternativa_2: { resp_descricao: [getVal('resp_alternativa_2')] },
            resp_alternativa_3: { resp_descricao: [getVal('resp_alternativa_3')] },
            resp_alternativa_4: { resp_descricao: [getVal('resp_alternativa_4')] },
            resp_alternativa_5: { resp_descricao: [getVal('resp_alternativa_5')] }
          },
          resp_justificativa_escola_solucao_de_ti: {
            resp_motivacao_justificativa_escolha: [getVal('resp_motivacao_justificativa_escolha')]
          },
          resp_relacao_demanda_prevista_e_quantidade: {
            resp_relacao_necessidade_volumes: [getVal('resp_relacao_necessidade_volumes')],
            resp_forma_calculo_quantitativo: getVal('resp_forma_calculo_quantitativo'),
            resp_natureza_objeto: [getVal('resp_natureza_objeto')],
            resp_modalidade_tipo_licitacao: [getVal('resp_modalidade_tipo_licitacao')],
            resp_parcelamento_objeto: [getVal('resp_parcelamento_objeto')],
            resp_vigencia_contrato: [getVal('resp_vigencia_contrato')]
          },
          resp_necessidades_adequacao_ambiente: {
            resp_infraestrutura_tecnologica: [getVal('resp_infraestrutura_tecnologica')],
            resp_infraestrutura_eletrica: [getVal('resp_infraestrutura_eletrica')],
            resp_logistica_implantacao: [getVal('resp_logistica_implantacao')],
            resp_espaco_fisico: [getVal('resp_espaco_fisico')],
            resp_mobiliario: [getVal('resp_mobiliario')]
          }
        };

        addLog(`Enviando ETP editado para geração do TR...`, 'TR', 'info');

        const result = await submitTR(trInput, (msg, type) => addLog(msg, 'TR', type));

        addLog('Todas as sugestões do TR foram recebidas com sucesso!', 'TR', 'success');
        setTrTraceId(result.trace_id);
        setTrResponse(result.texto_gerado);
        setTrStatus('success');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'TR', 'error');
        setTrStatus('error');
      }
    },
    [addLog, etpResponse, etpInputData]
  );

  /** Volta ao formulário para nova demanda */
  const handleReset = useCallback(() => {
    setScreen('form');
    setDodStatus('idle');
    setEtpStatus('idle');
    setTrStatus('idle');
    setDodLogs([]);
    setEtpLogs([]);
    setTrLogs([]);
    setDodResponse(null);
    setDodTraceId(null);
    setEtpResponse(null);
    setEtpTraceId(null);
    setTrResponse(null);
    setTrTraceId(null);
    setFormData(null);
    setEtpInputData(null);
    setIsStandardMode(false);
  }, []);

  const handleTabSwitch = (doc: CurrentDocument) => {
    setActiveTab(doc);
  };

  const isWideScreen = screen === 'result';
  const completedDocs: CurrentDocument[] = [];
  if (dodStatus === 'success') completedDocs.push('DOD');
  if (etpStatus === 'success') completedDocs.push('ETP');
  if (trStatus === 'success') completedDocs.push('TR');

  const loadingDocs: CurrentDocument[] = [];
  if (dodStatus === 'loading') loadingDocs.push('DOD');
  if (etpStatus === 'loading') loadingDocs.push('ETP');
  if (trStatus === 'loading') loadingDocs.push('TR');

  return (
    <div className="app-layout">
      <Header />

      <main className={`main-content ${isWideScreen ? 'main-content--wide' : ''}`}>
        {screen === 'form' && <FormPage onSubmit={handleFormSubmit} onSubmitStandard={handleStandardSubmit} />}

        {screen === 'result' && (
          <>
            <DocumentNavBar
              currentDoc={activeTab}
              completedDocs={completedDocs}
              loadingDocs={loadingDocs}
              onNavigate={handleTabSwitch}
            />

            {activeTab === 'DOD' && (
              dodStatus === 'loading' ? (
                <LoadingPage logs={dodLogs} docType="DOD" />
              ) : dodResponse && (
                <ResultPage
                  response={dodResponse}
                  onReset={handleReset}
                  onConfirmEditing={isStandardMode ? undefined : handleConfirmDODEditing}
                  traceId={dodTraceId}
                />
              )
            )}

            {activeTab === 'ETP' && (
              etpStatus === 'loading' ? (
                <LoadingPage logs={etpLogs} docType="ETP" />
              ) : etpResponse && (
                <ETPResultPage
                  response={etpResponse}
                  onReset={handleReset}
                  onConfirmEditing={isStandardMode ? undefined : handleConfirmETPEditing}
                  traceId={etpTraceId}
                />
              )
            )}

            {activeTab === 'TR' && (
              trStatus === 'loading' ? (
                <LoadingPage logs={trLogs} docType="TR" />
              ) : trResponse && (
                <TRResultPage
                  response={trResponse}
                  onReset={handleReset}
                  traceId={trTraceId}
                />
              )
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
