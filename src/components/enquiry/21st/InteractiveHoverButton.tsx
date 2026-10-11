import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import styles from "./InteractiveHoverButton.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

// 21st.dev Interactive Hover Button 969 by dillionverma / Magic UI.
// Retains the expanding dot, outgoing label, and incoming arrow-label motion.
export default function InteractiveHoverButton({ label, className = "", ...props }: Props) {
  return (
    <button {...props} className={`${styles.button} ${className}`} data-component="969" data-magnetic>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      <span className={styles.reveal} aria-hidden="true">
        {label}
        <ArrowRight size={15} strokeWidth={1.7} />
      </span>
    </button>
  );
}
