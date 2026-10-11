import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import styles from "./EnquiryFields.module.css";

// Semantic shell adapted from 21st.dev Input Form 26782 by uiable.
export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className={styles.group}>{children}</div>;
}

export function Field({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.field} ${wide ? styles.wide : ""}`}>{children}</div>;
}

export function FieldLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`${styles.label} ${props.className ?? ""}`} />;
}

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${styles.control} ${props.className ?? ""}`} />;
}

export function FieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={styles.selectWrap}>
      <select {...props} className={`${styles.control} ${styles.select} ${props.className ?? ""}`} />
    </span>
  );
}
