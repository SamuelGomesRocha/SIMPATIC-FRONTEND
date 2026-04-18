import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ItemObjetoTR } from '../../../types';
import type { FieldSelection } from '../../../types';

interface ObjetoTRFieldProps {
    fieldKey: string;
    label: string;
    selection: FieldSelection;
    onSelectionChange: (key: string, selection: FieldSelection) => void;
    // Initial data from the AI generation
    initialItem?: string;
    initialObjeto?: string;
    initialQtd?: string;
    initialUnidade?: string;
}

export const ObjetoTRField: React.FC<ObjetoTRFieldProps> = ({
    fieldKey,
    label,
    selection,
    onSelectionChange,
    initialItem = '',
    initialObjeto = '',
    initialQtd = '',
    initialUnidade = ''
}) => {
    // Initializes the list from JSON or creates a default row taking AI initial suggestion
    const [items, setItems] = useState<ItemObjetoTR[]>(() => {
        try {
            if (selection.customValue && selection.customValue !== '[]') {
                const parsed = JSON.parse(selection.customValue);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch {
            // fallback to default
        }
        return [{
            item: initialItem || '1',
            objeto: initialObjeto || '',
            quantidade: initialQtd || '1',
            metrica: '',
            unidade: initialUnidade || 'Und.'
        }];
    });

    // Update main store whenever the list changes
    useEffect(() => {
        onSelectionChange(fieldKey, {
            ...selection,
            customValue: JSON.stringify(items),
            isEditing: true, // Forces true to inject the custom value
            selectedIndex: -1
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, fieldKey]);

    const handleItemChange = (index: number, key: keyof ItemObjetoTR, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { item: String(items.length + 1), objeto: '', quantidade: '', metrica: '', unidade: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="suggestion-field">
            <div className="suggestion-field__header">
                <div className="suggestion-field__label-group">
                    <span className="suggestion-field__label">{label}</span>
                </div>
            </div>

            <div className="suggestion-field__form-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {/* Horizontal scroll container for the table if it gets squeezed on mobile */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <div style={{ minWidth: '800px' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(50px, 0.5fr) minmax(300px, 3fr) minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) 40px',
                            gap: '12px',
                            padding: '12px 12px 6px 12px',
                            alignItems: 'center'
                        }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Item</label>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Objeto</label>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Qtd</label>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Métrica</label>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Unidade</label>
                            <span></span>
                        </div>

                        {/* Table Rows */}
                        {items.map((item, index) => (
                            <div key={index} style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(50px, 0.5fr) minmax(300px, 3fr) minmax(80px, 1fr) minmax(120px, 1.5fr) minmax(100px, 1fr) 40px',
                                gap: '12px',
                                alignItems: 'start',
                                padding: '8px 12px',
                                background: '#f8f9fa',
                                borderTop: '1px solid #e2e8f0',
                                transition: 'background-color 0.2s ease'
                            }}>
                                <input
                                    type="text"
                                    className="suggestion-field__textarea"
                                    style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none' }}
                                    value={item.item}
                                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                    placeholder="1"
                                />
                                <textarea
                                    className="suggestion-field__textarea"
                                    style={{ height: '38px', padding: '8px', minHeight: '38px', overflowY: 'auto' }}
                                    value={item.objeto}
                                    onChange={(e) => handleItemChange(index, 'objeto', e.target.value)}
                                    placeholder="Descrição detalhada do objeto..."
                                />
                                <input
                                    type="text"
                                    className="suggestion-field__textarea"
                                    style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none' }}
                                    value={item.quantidade}
                                    onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                                    placeholder="Ex: 5"
                                />
                                <input
                                    type="text"
                                    className="suggestion-field__textarea"
                                    style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none' }}
                                    value={item.metrica}
                                    onChange={(e) => handleItemChange(index, 'metrica', e.target.value)}
                                    placeholder="Ex: Por usuário..."
                                />
                                <input
                                    type="text"
                                    className="suggestion-field__textarea"
                                    style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none' }}
                                    value={item.unidade}
                                    onChange={(e) => handleItemChange(index, 'unidade', e.target.value)}
                                    placeholder="Ex: Meses"
                                />
                                <button
                                    onClick={() => removeItem(index)}
                                    disabled={items.length <= 1}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: items.length <= 1 ? '#cbd5e1' : '#ef4444',
                                        cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                                        padding: '10px 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 0.2s ease',
                                        height: '38px'
                                    }}
                                    title={items.length <= 1 ? "Mínimo de 1 item" : "Remover linha"}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', padding: '8px 12px 4px 12px' }}>
                    <button
                        onClick={addItem}
                        className="btn btn--secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                        <Plus size={16} /> Adicionar Linha
                    </button>
                </div>
            </div>
        </div>
    );
};
