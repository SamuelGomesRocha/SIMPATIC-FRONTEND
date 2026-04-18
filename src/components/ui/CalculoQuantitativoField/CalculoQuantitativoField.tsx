import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ItemFormaCalculo } from '../../../types';
import type { FieldSelection } from '../../../types';

interface CalculoQuantitativoFieldProps {
    fieldKey: string;
    label: string;
    selection: FieldSelection;
    onSelectionChange: (key: string, selection: FieldSelection) => void;
}

export const CalculoQuantitativoField: React.FC<CalculoQuantitativoFieldProps> = ({
    fieldKey,
    label,
    selection,
    onSelectionChange
}) => {
    // Inicializa a lista a partir do JSON ou de um item vazio
    const [items, setItems] = useState<ItemFormaCalculo[]>(() => {
        try {
            const parsed = JSON.parse(selection.customValue || '[]');
            return parsed.length > 0 ? parsed : [{ item: '', estimativa_qtd: '', forma_estimativa: '' }];
        } catch {
            return [{ item: '', estimativa_qtd: '', forma_estimativa: '' }];
        }
    });

    // Atualiza o store principal toda vez que a lista local mudar
    useEffect(() => {
        onSelectionChange(fieldKey, {
            ...selection,
            customValue: JSON.stringify(items),
            isEditing: true, // Força true para injetar o valor customizado
            selectedIndex: -1
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, fieldKey]);

    const handleItemChange = (index: number, key: keyof ItemFormaCalculo, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { item: '', estimativa_qtd: '', forma_estimativa: '' }]);
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
                {items.map((item, index) => (
                    <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(200px, 2fr) auto',
                        gap: '12px',
                        alignItems: 'start',
                        padding: '12px',
                        background: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Item</label>
                            <input
                                type="text"
                                className="suggestion-field__textarea"
                                style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none', overflow: 'hidden' }}
                                value={item.item}
                                onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                placeholder="Nome do item/serviço..."
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Estimativa (Qtd)</label>
                            <input
                                type="text"
                                className="suggestion-field__textarea"
                                style={{ height: '38px', padding: '8px', minHeight: 'unset', resize: 'none', overflow: 'hidden' }}
                                value={item.estimativa_qtd}
                                onChange={(e) => handleItemChange(index, 'estimativa_qtd', e.target.value)}
                                placeholder="10 unid."
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Forma de Estimativa</label>
                            <textarea
                                className="suggestion-field__textarea"
                                style={{ height: '38px', padding: '8px', minHeight: '38px', overflowY: 'auto' }}
                                value={item.forma_estimativa}
                                onChange={(e) => handleItemChange(index, 'forma_estimativa', e.target.value)}
                                placeholder="Série histórica, benchmark..."
                            />
                        </div>
                        <div style={{ alignSelf: 'flex-start', marginTop: '24px' }}>
                            <button
                                onClick={() => removeItem(index)}
                                disabled={items.length <= 1}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: items.length <= 1 ? '#cbd5e1' : '#ef4444',
                                    cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s ease'
                                }}
                                title={items.length <= 1 ? "Mínimo de 1 item" : "Remover item"}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addItem}
                    className="btn btn--secondary"
                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}
                >
                    <Plus size={16} /> Adicionar Item
                </button>
            </div>
        </div>
    );
};
