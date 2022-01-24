import React from 'react'

type QueryLimitFieldProps = {
  limitValue: string
  onChange: (value: string) => void
}

export const QueryLimitField: React.FC<QueryLimitFieldProps> = ({
  limitValue,
  onChange
}) => {
  return (
    <span
      className="limit-field"
      key={"1"}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="limit-label">
        <span>Row Limit</span>
        <input
          type="text"
          className="limit-text-field"
          key="limit-input"
          onChange={(e) => onChange(e.target.value)}
          value={limitValue}
          placeholder={"500"}
        />
      </label>
    </span>
  )
}
