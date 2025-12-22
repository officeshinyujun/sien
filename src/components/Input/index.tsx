'use client'

import { type ChangeEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    width?: string;
    height?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input(props: Props) {
    const { 
        className = '', 
        width = '100%', 
        height = '40px',
        type: propType = 'text',
        ...rest 
    } = props;
    
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = propType === 'password';
    const inputType = isPassword && !showPassword ? 'password' : 'text';
    return (
        <div style={{ position: 'relative', width: width }}>
            <input
                style={{
                    width: '100%',
                    height: height,
                    padding: `0 ${isPassword ? '40px 0 10px' : '10px'}`,
                    boxSizing: 'border-box',
                    borderRadius: '16px',
                    color: '#111',
                    border: '1px solid #E0E0E0',
                    background: 'none',
                    outline: 'none',
                    fontSize: '14px'
                }}
                className={className}
                type={inputType}
                {...rest}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#B4B4B5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            )}
        </div>
    )
}