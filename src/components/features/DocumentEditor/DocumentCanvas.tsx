import type { DODResponse, FieldSelection } from '../../../types';
import DocumentField from './DocumentField';
import { getSelectedValue } from '../../../utils/helpers';

interface DocumentCanvasProps {
    response: DODResponse;
    selections: Record<string, FieldSelection>;
    activeField: string | null;
    onFieldFocus: (key: string) => void;
    onFieldChange: (fieldKey: string, value: string) => void;
}

export default function DocumentCanvas({
    response,
    selections,
    activeField,
    onFieldFocus,
    onFieldChange,
}: DocumentCanvasProps) {

    const getField = (key: string) => {
        let suggestions: string[] = [];
        if (key.startsWith('planejamento_estrategico.')) {
            const subKey = key.split('.')[1];
            suggestions = (response.planejamento_estrategico as any)[subKey] || [];
        } else {
            suggestions = (response as any)[key] || [];
        }

        return (
            <DocumentField
                fieldKey={key}
                value={getSelectedValue(key, suggestions, selections)}
                isActive={activeField === key}
                onFocus={onFieldFocus}
                onChange={onFieldChange}
            />
        );
    };

    return (
        <div className="document-canvas">
            {/* Header mockup style */}
            <table width="100%" cellPadding="4" cellSpacing="0" style={{ border: '1px solid #808080', marginBottom: '2rem' }}>
                <tbody>
                    <tr>
                        <td rowSpan={2} width="180" style={{ borderRight: '1px solid #808080', padding: '10px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '24px' }}>PJ</div>
                            <div style={{ fontSize: '10px' }}>Poder Judiciário de Goiás</div>
                        </td>
                        <td style={{ borderBottom: '1px solid #808080', padding: '10px', textAlign: 'center' }}>
                            <strong>DOCUMENTO DE OFICIALIZAÇÃO DA DEMANDA</strong>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                            Processo de Planejamento de Aquisições e de Contratações de Soluções de TIC
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Identificação Section */}
            <h3 style={{ fontSize: '14pt', marginBottom: '1rem' }}>1. Identificação da Solução de TIC</h3>
            <table width="100%" cellPadding="8" cellSpacing="0" style={{ border: '1px solid #808080', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <tbody>
                    <tr>
                        <td width="25%" style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Nome do Projeto:</strong></td>
                        <td width="45%" style={{ border: '1px solid #808080' }}>{getField('nome_projeto')}</td>
                        <td width="15%" style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Data:</strong></td>
                        <td width="15%" style={{ border: '1px solid #808080' }}>{getField('data_envio')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Identificação PCA:</strong></td>
                        <td colSpan={3} style={{ border: '1px solid #808080' }}>{getField('identificacao_pca')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Fonte de Recursos:</strong></td>
                        <td colSpan={3} style={{ border: '1px solid #808080' }}>{getField('fonte_recurso')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Alinhamento LOA:</strong></td>
                        <td colSpan={3} style={{ border: '1px solid #808080' }}>{getField('alinhamento_loa')}</td>
                    </tr>
                </tbody>
            </table>

            {/* Justificativa e Motivação */}
            <h3 style={{ fontSize: '14pt', marginBottom: '0.5rem' }}>2. Motivação e Justificativa</h3>
            <div style={{ padding: '10px', border: '1px solid #808080', minHeight: '100px', marginBottom: '2rem' }}>
                {getField('motivacao_justificativa')}
            </div>

            {/* Resultados e Benefícios */}
            <h3 style={{ fontSize: '14pt', marginBottom: '0.5rem' }}>3. Resultados e Benefícios</h3>
            <div style={{ padding: '10px', border: '1px solid #808080', minHeight: '100px', marginBottom: '2rem' }}>
                {getField('resultados_beneficios')}
            </div>

            {/* Planejamento Estratégico */}
            <h3 style={{ fontSize: '14pt', marginBottom: '1rem' }}>4. Alinhamento Estratégico</h3>
            <table width="100%" cellPadding="8" cellSpacing="0" style={{ border: '1px solid #808080', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td width="30%" style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Plano de Gestão:</strong></td>
                        <td style={{ border: '1px solid #808080' }}>{getField('planejamento_estrategico.plano_gestao')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>Plano Anual:</strong></td>
                        <td style={{ border: '1px solid #808080' }}>{getField('planejamento_estrategico.plano_anual_contratacoes')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>PDTIC:</strong></td>
                        <td style={{ border: '1px solid #808080' }}>{getField('planejamento_estrategico.pdtic')}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #808080', backgroundColor: '#f5f5f5' }}><strong>ENTIC-JUD:</strong></td>
                        <td style={{ border: '1px solid #808080' }}>{getField('planejamento_estrategico.entic_jud')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
