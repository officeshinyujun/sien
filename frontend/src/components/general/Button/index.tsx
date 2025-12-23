
interface Props {
    width?: number;
    height?: number;
    onClick?: () => void;
    className: string;
    children?: React.ReactNode;  // Changed from 'child' to 'children'
    leftIcon ?: string;
    rightIcon ?: string;
    disabled?: boolean;
}

export default function Button({ width, height, onClick, className, children, leftIcon, rightIcon, disabled }: Props) {
    return (
        <button 
            className={className} 
            onClick={onClick} 
            disabled={disabled}
            style={{
                width, 
                height, 
                outline: 'none', 
                border: "none", 
                background: "none",
                borderRadius: 8,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                opacity: disabled ? 0.6 : 1,
            }}
        >
            {leftIcon && <img width={24} height={24} src={leftIcon} alt="leftIcon" />}
            {children}
            {rightIcon && <img width={24} height={24} src={rightIcon} alt="rightIcon" />}
        </button>
    );
}