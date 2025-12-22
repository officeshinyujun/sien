
import Image from "next/image";
interface Props {
    width?: number;
    height?: number;
    onClick?: () => void;
    className: string;
    children?: React.ReactNode;  // Changed from 'child' to 'children'
    leftIcon ?: string;
    rightIcon ?: string;
}

export default function Button({ width, height, onClick, className, children, leftIcon, rightIcon }: Props) {
    return (
        <button 
            className={className} 
            onClick={onClick} 
            style={{
                width, 
                height, 
                outline: 'none', 
                border: "none", 
                background: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
            }}
        >
            {leftIcon && <Image width={24} height={24} src={leftIcon} alt="leftIcon" />}
            {children}
            {rightIcon && <Image width={24} height={24} src={rightIcon} alt="rightIcon" />}
        </button>
    );
}