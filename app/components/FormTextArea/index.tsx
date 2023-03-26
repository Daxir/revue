import { Textarea } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormTextAreaProps {
  name: string;
  label: string;
  isRequired?: boolean;
}

export default function FormTextArea({
  name,
  label,
  isRequired = false,
  ...rest
}: FormTextAreaProps & TextInputProps) {
  const { getInputProps, error } = useField(name);

  return (
    <Textarea
      label={label}
      withAsterisk={isRequired}
      error={error}
      {...getInputProps({
        id: name,
      })}
    />
  );
}
