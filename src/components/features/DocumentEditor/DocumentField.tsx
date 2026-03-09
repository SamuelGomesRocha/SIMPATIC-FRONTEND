import { useRef, useEffect } from 'react';

interface DocumentFieldProps {
    value: string;
    fieldKey: string;
    isActive: boolean;
    onFocus: (key: string) => void;
    onChange: (key: string, value: string) => void;
    placeholder?: string;
}

export default function DocumentField({
    value,
    fieldKey,
    isActive,
    onFocus,
    onChange,
    placeholder = 'Clique para preencher...',
}: DocumentFieldProps) {
    const contentEditableRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isActive && contentEditableRef.current) {
            contentEditableRef.current.focus();
        }
    }, [isActive]);

    const handleBlur = () => {
        if (contentEditableRef.current) {
            onChange(fieldKey, contentEditableRef.current.innerText);
        }
    };

    return (
        <span
            ref={contentEditableRef}
            contentEditable
            suppressContentEditableWarning
            className={`document-field ${isActive ? 'document-field--active' : ''} ${!value ? 'document-field--empty' : ''
                }`}
            onFocus={() => onFocus(fieldKey)}
            onBlur={handleBlur}
            title={`Editar ${fieldKey}`}
        >
            {value || (isActive ? '' : placeholder)}
        </span>
    );
}
