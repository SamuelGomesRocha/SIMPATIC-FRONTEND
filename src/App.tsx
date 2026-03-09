import { useState, useCallback } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FormPage from './pages/FormPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';
import ETPResultPage from './pages/ETPResultPage';
import TRResultPage from './pages/TRResultPage';
import type { DemandaInput, DODResponse, ETPInput, ETPResponse, TRInput, TRResponse, LogEntry } from './types';
import { submitDemanda } from './api/dodService';
import { submitETP } from './api/etpService';
import { submitTR } from './api/trService';
import { generateId, getSelectedValue } from './utils/helpers';
import DocumentNavBar from './components/layout/DocumentNavBar';
import type { CurrentDocument } from './components/layout/DocumentNavBar';
import './styles/global.css';

type AppScreen = 'form' | 'loading' | 'result' | 'etp-loading' | 'etp-result' | 'tr-loading' | 'tr-result';

/**
 * Componente raiz da aplicação.
 * Gerencia o fluxo entre Formulário → Carregamento DOD → Resultado DOD → Carregamento ETP → Resultado ETP.
 */
export default function App() {
  const [screen, setScreen] = useState<AppScreen>('form');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dodResponse, setDodResponse] = useState<DODResponse | null>(null);
  const [etpResponse, setEtpResponse] = useState<ETPResponse | null>(null);
  const [trResponse, setTrResponse] = useState<TRResponse | null>(null);
  const [formData, setFormData] = useState<DemandaInput | null>(null);
  // Store intermediate inputs
  const [etpInputData, setEtpInputData] = useState<ETPInput | null>(null);

  /** Calculate completed docs for the navigation bar */
  const completedDocs: CurrentDocument[] = [];
  if (dodResponse) completedDocs.push('DOD');
  if (etpResponse) completedDocs.push('ETP');
  if (trResponse) completedDocs.push('TR');

  /** Handle navigation between completed documents */
  const handleNav = (doc: CurrentDocument) => {
    if (doc === 'DOD' && dodResponse) setScreen('result');
    if (doc === 'ETP' && etpResponse) setScreen('etp-result');
    if (doc === 'TR' && trResponse) setScreen('tr-result');
  };

  /** Adiciona uma entrada ao console de logs */
  const addLog = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      setLogs((prev) => [
        ...prev,
        {
          id: generateId(),
          timestamp: new Date(),
          message,
          type,
        },
      ]);
    },
    []
  );

  /** Callback do formulário → dispara a requisição DOD */
  const handleFormSubmit = useCallback(
    async (data: DemandaInput) => {
      setFormData(data);
      setScreen('loading');
      setLogs([]);
      addLog('Iniciando processo de geração de sugestões do DOD...', 'info');

      try {
        addLog(`Demanda: ${data.demanda_unidade} | PCA: ${data.pca}`, 'info');

        const result = await submitDemanda(data, (msg, type) => addLog(msg, type));

        addLog('Todas as sugestões do DOD foram recebidas com sucesso!', 'success');
        setDodResponse(result);

        setTimeout(() => {
          setScreen('result');
        }, 1200);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'error');
        addLog(
          'Verifique a conexão com a API e tente novamente. Use o botão ⚙ API no cabeçalho para configurar.',
          'warning'
        );

        setTimeout(() => {
          setScreen('form');
        }, 4000);
      }
    },
    [addLog]
  );

  /** 
   * Callback "Confirmar Edição" do DOD → dispara requisição ETP 
   * Monta o corpo da requisição combinando dados do formulário + sugestões selecionadas do DOD
   */
  const handleConfirmDODEditing = useCallback(
    async (selections: Record<string, import('./types').FieldSelection>) => {
      if (!dodResponse || !formData) return;

      setScreen('etp-loading');
      setLogs([]);
      addLog('Preparando dados do DOD editado para geração do ETP...', 'info');

      try {
        // Helper to get the selected value for a field
        const getVal = (key: string): string[] => {
          let suggestions: string[] = [];
          if (key.startsWith('planejamento_estrategico.')) {
            const subKey = key.split('.')[1];
            suggestions = ((dodResponse.planejamento_estrategico as unknown) as Record<string, string[]>)[subKey] || [];
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
        addLog(`Enviando DOD editado para geração do ETP...`, 'info');

        const result = await submitETP(etpInput, (msg, type) => addLog(msg, type));

        addLog('Todas as sugestões do ETP foram recebidas com sucesso!', 'success');
        setEtpResponse(result);

        setTimeout(() => {
          setScreen('etp-result');
        }, 1200);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'error');
        addLog(
          'Verifique a conexão com a API e tente novamente.',
          'warning'
        );

        // Volta ao resultado do DOD após 4s de erro
        setTimeout(() => {
          setScreen('result');
        }, 4000);
      }
    },
    [addLog, dodResponse, formData]
  );

  /** 
   * Callback "Confirmar Edição" do ETP → dispara requisição TR 
   */
  const handleConfirmETPEditing = useCallback(
    async (selections: Record<string, import('./types').FieldSelection>) => {
      if (!etpResponse || !etpInputData) return;

      setScreen('tr-loading');
      setLogs([]);
      addLog('Preparando dados do ETP editado para geração do TR...', 'info');

      try {
        const getVal = (key: string): any => {
          let suggestions: any[] = [];
          // Se for um campo sub-nível do objeto ETP
          if (key.match(/^resp_alternativa_\d+$/)) {
            suggestions = (etpResponse.resp_avaliacao_diferentes_solucoes_disponiveis as any)?.[key]?.resp_descricao || [];
            return getSelectedValue(key, suggestions, selections);
          }

          if (['resp_periodo_analisado', 'resp_termos_analisados', 'resp_metodologia_de_calculo'].includes(key)) {
            suggestions = (etpResponse.resp_avaliacao_diferentes_solucoes_disponiveis as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }

          if (['resp_parcelas_fornecimento', 'resp_quantitativo_bens_servicos', 'resp_motivacao_justificativa_escolha'].includes(key)) {
            suggestions = (etpResponse.resp_justificativa_escola_solucao_de_ti as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }

          if (['resp_relacao_necessidade_volumes', 'resp_forma_calculo_quantitativo', 'resp_natureza_objeto', 'resp_modalidade_tipo_licitacao', 'resp_parcelamento_objeto', 'resp_vigencia_contrato'].includes(key)) {
            suggestions = (etpResponse.resp_relacao_demanda_prevista_e_quantidade as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }

          if (['resp_infraestrutura_tecnologica', 'resp_infraestrutura_eletrica', 'resp_logistica_implantacao', 'resp_espaco_fisico', 'resp_mobiliario'].includes(key)) {
            suggestions = (etpResponse.resp_necessidades_adequacao_ambiente as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }

          if (['resp_mni', 'resp_icp_brasil', 'resp_moreq_jus'].includes(key)) {
            suggestions = (etpResponse.resp_requisitos_padroes_interoperabilidade as any)?.[key] || [];
            return getSelectedValue(key, suggestions, selections);
          }

          // Se for um campo de matriz de objetos (passamos exatamente o que veio no selectedIndex se for o objeto todo)
          if (['resp_necessidade_recursos_materiais_humanos', 'resp_estrategia_continuidade', 'resp_estrategia_independencia_tjgo', 'resp_acoes_transicao'].includes(key)) {
            suggestions = (etpResponse as any)[key] || [];
            // Aqui selections[key] contém selectedIndex que é o índice do array, mas como a estrutura é grande,
            // para arrays de objetos o frontend apenas "confirmou", vamos enviar o array completo como foi recebido na API.
            // Ajuste: Vamos retornar o array todo como está na API.
            return suggestions;
          }

          // Campos simples
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
            resp_parcelas_fornecimento: [getVal('resp_parcelas_fornecimento')],
            resp_quantitativo_bens_servicos: [getVal('resp_quantitativo_bens_servicos')],
            resp_motivacao_justificativa_escolha: [getVal('resp_motivacao_justificativa_escolha')]
          },
          resp_relacao_demanda_prevista_e_quantidade: {
            resp_relacao_necessidade_volumes: [getVal('resp_relacao_necessidade_volumes')],
            resp_forma_calculo_quantitativo: [getVal('resp_forma_calculo_quantitativo')],
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

        addLog(`Enviando ETP editado para geração do TR...`, 'info');

        const result = await submitTR(trInput, (msg, type) => addLog(msg, type));

        addLog('Todas as sugestões do TR foram recebidas com sucesso!', 'success');
        setTrResponse(result);

        setTimeout(() => {
          setScreen('tr-result');
        }, 1200);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha: ${errorMsg}`, 'error');
        addLog(
          'Verifique a conexão com a API e tente novamente.',
          'warning'
        );

        setTimeout(() => {
          setScreen('etp-result');
        }, 4000);
      }
    },
    [addLog, etpResponse, etpInputData]
  );

  /** Volta ao formulário para nova demanda */
  const handleReset = useCallback(() => {
    setScreen('form');
    setDodResponse(null);
    setEtpResponse(null);
    setTrResponse(null);
    setFormData(null);
    setEtpInputData(null);
    setLogs([]);
  }, []);

  const isWideScreen = screen === 'result' || screen === 'etp-result' || screen === 'tr-result';

  return (
    <div className="app-layout">
      <Header />

      <main className={`main-content ${isWideScreen ? 'main-content--wide' : ''}`}>
        {screen === 'form' && <FormPage onSubmit={handleFormSubmit} />}

        {screen === 'loading' && (
          <LoadingPage logs={logs} docType="DOD" />
        )}

        {screen === 'result' && dodResponse && (
          <>
            <DocumentNavBar
              currentDoc="DOD"
              completedDocs={completedDocs}
              onNavigate={handleNav}
            />
            <ResultPage
              response={dodResponse}
              onReset={handleReset}
              onConfirmEditing={handleConfirmDODEditing}
            />
          </>
        )}

        {screen === 'etp-loading' && (
          <LoadingPage logs={logs} docType="ETP" />
        )}

        {screen === 'etp-result' && etpResponse && (
          <>
            <DocumentNavBar
              currentDoc="ETP"
              completedDocs={completedDocs}
              onNavigate={handleNav}
            />
            <ETPResultPage
              response={etpResponse}
              onReset={handleReset}
              onConfirmEditing={handleConfirmETPEditing}
            />
          </>
        )}

        {screen === 'tr-loading' && (
          <LoadingPage logs={logs} docType="TR" />
        )}

        {screen === 'tr-result' && trResponse && (
          <>
            <DocumentNavBar
              currentDoc="TR"
              completedDocs={completedDocs}
              onNavigate={handleNav}
            />
            <TRResultPage response={trResponse} onReset={handleReset} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
