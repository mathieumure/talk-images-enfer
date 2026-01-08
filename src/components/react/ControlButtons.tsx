interface ControlButtonsProps {
  label: string;
  options: Array<{ value: number; label: string }>;
  currentValue: number;
  onChange: (value: number) => void;
}

export default function ControlButtons({ label, options, currentValue, onChange }: ControlButtonsProps) {
  return (
    <div className="srcset-control-group">
      <label>{label}</label>
      <div className="srcset-button-group">
        {options.map((option) => (
          <button
            key={option.value}
            className={currentValue === option.value ? 'srcset-active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}