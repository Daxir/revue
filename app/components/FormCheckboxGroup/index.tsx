import type { CheckboxGroupProps } from "@mantine/core";
import { Checkbox } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormCheckboxGroupProps {
  name: string;
  data: {
    value: string;
    label: string;
  }[];
}

export default function FormCheckboxGroup({
  name,
  data,
  ...rest
}: FormCheckboxGroupProps & Omit<CheckboxGroupProps, "children">) {
  const { getInputProps, error } = useField(name);
  return (
    <Checkbox.Group error={error} {...rest}>
      {data.map(({ value, label }) => (
        <Checkbox
          key={value}
          label={label}
          value={value}
          name={name}
          {...getInputProps({
            id: name,
          })}
        />
      ))}
    </Checkbox.Group>
  );
}
