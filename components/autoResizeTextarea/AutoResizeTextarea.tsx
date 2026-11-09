import { forwardRef, TextareaHTMLAttributes, useEffect, useImperativeHandle, useRef } from "react";

type InputBarProps = {
    value: string;
    onChange: (text: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

import styles from "./autoResizeTextarea.module.css"

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, InputBarProps>(function InputBar(
    { value, onChange, placeholder = "사용자 질문 입력", ...rest},
    ref
) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current!);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    return (
        <textarea
        {...rest}
        ref={textareaRef}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}>

        </textarea>
    )
});

export default AutoResizeTextarea;