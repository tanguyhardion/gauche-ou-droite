import { component$, type QRL } from '@builder.io/qwik';
import styles from './choice-button.css?inline';

interface ChoiceButtonProps {
  label: string;
  onClick$: QRL<() => void>;
  variant: 'left' | 'right';
  disabled?: boolean;
}

export const ChoiceButton = component$<ChoiceButtonProps>(({ label, onClick$, variant, disabled = false }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={styles} />
      <button 
        class={`choice-button choice-button--${variant}`}
        onClick$={onClick$}
        disabled={disabled}
        type="button"
      >
        {label}
      </button>
    </>
  );
});
