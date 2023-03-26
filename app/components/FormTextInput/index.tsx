import { TextInput } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormTextInputProps {
  name: string;
  label: string;
  isRequired?: boolean;
}

export default function FormTextInput({
  name,
  label,
  isRequired = false,
  ...rest
}: FormTextInputProps & TextInputProps) {
  const { getInputProps, error } = useField(name);

  return (
    <TextInput
      label={label}
      withAsterisk={isRequired}
      error={error}
      {...getInputProps({
        id: name,
        ...rest,
      })}
    />
  );
}
