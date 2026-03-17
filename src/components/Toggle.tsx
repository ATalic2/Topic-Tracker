interface ToggleProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ id, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="toggle-wrap">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="toggle-track" />
    </div>
  )
}
