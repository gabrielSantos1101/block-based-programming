"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

type DatePickerInputProps = {
  id?: string
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  defaultDate?: Date
  disabled?: boolean
}

export function DatePickerInput({
  id = "date-input",
  label = "Select date",
  placeholder = "Pick a date",
  value,
  onChange,
  defaultDate,
  disabled,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)
  const initial = React.useMemo(
    () => (value ? new Date(value) : defaultDate),
    [value, defaultDate]
  )
  const [date, setDate] = React.useState<Date | undefined>(initial)
  const [month, setMonth] = React.useState<Date | undefined>(initial)
  const [inputValue, setInputValue] = React.useState(formatDate(initial))

  React.useEffect(() => {
    const next = value ? new Date(value) : defaultDate
    setDate(next)
    setMonth(next)
    setInputValue(formatDate(next))
  }, [value, defaultDate])

  return (
    <Field className="w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            const date = new Date(e.target.value)
            setInputValue(e.target.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
              onChange?.(date.toISOString())
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-picker`}
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                  disabled={disabled}
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  setDate(date)
                  setInputValue(formatDate(date))
                  if (date) {
                    onChange?.(date.toISOString())
                  }
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
