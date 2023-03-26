import type { CheckboxProps } from "@mantine/core";
import { Checkbox } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormCheckboxProps {
  name: string;
  label: string;
  labelPosition?: string;
  required?: boolean;
}

export default function FormCheckbox({
  name,
  label,
  labelPosition,
}: FormCheckboxProps & CheckboxProps) {
  const { getInputProps, error } = useField(name);
  return (
    <Checkbox
      name={name}
      label={label}
      labelPosition={labelPosition}
      error={error}
      {...getInputProps({
        id: name,
      })}
    />
  );
}
