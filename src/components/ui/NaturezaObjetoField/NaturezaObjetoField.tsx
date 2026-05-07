import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import './NaturezaObjetoField.css';
import type { FieldSelection } from '../../../types';

// O Vite permite importar JSON diretamente como o default export ou um module interop
import rawNaturezaData from '../../../../doc_models/natureza_objeto.json';

interface NaturezaItem {
    codigo: string;
    descricao: string;
    orientacao?: string;
}

const naturezaData: NaturezaItem[] = rawNaturezaData as NaturezaItem[];

interface NaturezaObjetoFieldProps {
    fieldKey: string;
    label?: string;
    selection: FieldSelection;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
}

export const NaturezaObjetoField: React.FC<NaturezaObjetoFieldProps> = ({
    fieldKey,
    label,
    onSelectionChange,
}) => {
    // Tenta parsear caso o valor já exista como uma string JSON válida ou string simples
    // A estrutura final exigida é: "prefixo.codigo - descricao"
    const [modelo, setModelo] = useState<'Investimento' | 'Custeio'>('Investimento');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<NaturezaItem | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // O prefixo depende do Modelo de Contratação escolhido
    const prefixo = modelo === 'Investimento' ? '44.90' : '33.90';

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Atualiza a Selection no estado PAI sempre que modelo ou selectedItem mudar
    useEffect(() => {
        if (selectedItem) {
            const finalString = `${prefixo}.${selectedItem.codigo} - ${selectedItem.descricao}`;
            onSelectionChange(fieldKey, {
                isEditing: true,
                customValue: finalString,
            });
        } else {
            onSelectionChange(fieldKey, {
                isEditing: true,
                customValue: '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelo, selectedItem, prefixo]);

    // Filtra itens com base na query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return naturezaData.slice(0, 50); // Mostra os 50 primeiros se não houver busca
        const query = searchQuery.toLowerCase();
        return naturezaData.filter(
            (item) =>
                item.descricao.toLowerCase().includes(query) ||
                item.codigo.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSelectOption = (item: NaturezaItem) => {
        setSelectedItem(item);
        setSearchQuery(item.descricao);
        setIsDropdownOpen(false);
    };

    const handleClearSelection = () => {
        setSelectedItem(null);
        setSearchQuery('');
        // Manter o dropdown aberto para nova busca
        setTimeout(() => setIsDropdownOpen(true), 0);
    };

    return (
        <div className="suggestion-field">
            <div className="suggestion-field__header">
                <div className="suggestion-field__label-group">
                    <span className="suggestion-field__label">{label || 'Modelo da Contratação (Natureza do Objeto)'}</span>
                </div>
            </div>

            <div className="suggestion-field__form-group" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p className="natureza-objeto-field__desc" style={{ marginTop: 0, marginBottom: 0 }}>
                    Selecione o modelo da contratação e busque pelo código de natureza de despesa.
                </p>

                <div className="natureza-objeto-field__content">
                    {/* 1. Seleção: Investimento ou Custeio */}
                <div className="natureza-objeto-field__group">
                    <label className="natureza-objeto-field__label">Modelo da Contratação</label>
                    <select
                        className="natureza-objeto-field__select"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value as 'Investimento' | 'Custeio')}
                    >
                        <option value="Investimento">1. Investimento (44.90)</option>
                        <option value="Custeio">2. Custeio (33.90)</option>
                    </select>
                </div>

                {/* 2. Busca de Código */}
                <div className="natureza-objeto-field__group" ref={dropdownRef}>
                    <label className="natureza-objeto-field__label">Código / Descrição</label>
                    <div className="natureza-objeto-field__search-container">
                        <Search size={16} className="natureza-objeto-field__search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por descrição ou código..."
                            className="natureza-objeto-field__search-input"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                                if (selectedItem && e.target.value !== selectedItem.descricao) {
                                    setSelectedItem(null);
                                }
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                        />
                        {searchQuery && (
                            <button
                                className="natureza-objeto-field__clear-icon"
                                onClick={handleClearSelection}
                                title="Limpar busca"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* Dropdown de Resultados */}
                        {isDropdownOpen && (
                            <div className="natureza-objeto-field__results">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <div
                                            key={item.codigo}
                                            className={`natureza-objeto-field__result-item ${
                                                selectedItem?.codigo === item.codigo ? 'natureza-objeto-field__result-item--active' : ''
                                            }`}
                                            onClick={() => handleSelectOption(item)}
                                            title={item.orientacao}
                                        >
                                            <span className="natureza-objeto-field__result-code">{prefixo}.{item.codigo}</span>
                                            <span className="natureza-objeto-field__result-desc">{item.descricao}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="natureza-objeto-field__no-results">
                                        Nenhum resultado encontrado para "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Visão final formatada */}
                {selectedItem && (
                    <div className="natureza-objeto-field__final-value">
                        <div className="natureza-objeto-field__final-label">Valor Final Gerado</div>
                        <div className="natureza-objeto-field__final-text">
                            {prefixo}.{selectedItem.codigo} - {selectedItem.descricao}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};
