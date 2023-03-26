import { NativeSelect } from "@mantine/core";
import type { NativeSelectProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormSelectProps {
  name: string;
}

export default function FormSelect({
  name,
  label,
  ...rest
}: FormSelectProps & NativeSelectProps) {
  const { getInputProps, error } = useField(name);
  return (
    <NativeSelect
      label={label}
      error={error}
      {...rest}
      {...getInputProps({
        id: name,
        ...rest,
      })}
    />
  );
}
