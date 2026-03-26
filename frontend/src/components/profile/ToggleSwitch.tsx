interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 transition-colors"
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: checked ? 'var(--nutritrack-primary)' : 'rgba(113, 113, 122, 0.3)',
      }}
    >
      <div
        className="absolute top-1 transition-all"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: 'white',
          left: checked ? '26px' : '2px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        }}
      />
    </button>
  );
}
