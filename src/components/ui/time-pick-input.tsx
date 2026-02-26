"use client"

import * as React from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TimePickerInputProps = {
  id?: string
  label?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  stepSeconds?: number
  defaultValue?: string
}

export function TimePickerInput({
  id = "time-picker",
  label = "Time",
  value,
  onChange,
  disabled,
  stepSeconds = 1,
  defaultValue = "10:30:00",
}: TimePickerInputProps) {
  const [inputValue, setInputValue] = React.useState(value ?? defaultValue)

  React.useEffect(() => {
    setInputValue(value ?? "")
  }, [value])

  return (
    <Field className="w-32">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        type="time"
        id={id}
        step={stepSeconds}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          onChange?.(e.target.value)
        }}
        defaultValue={value ? undefined : defaultValue}
        disabled={disabled}
        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </Field>
  )
}
