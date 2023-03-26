import { PasswordInput } from "@mantine/core";
import type { PasswordInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormPasswordInputProps {
  name: string;
  label: string;
  isRequired?: boolean;
  description?: string;
}

export default function FormPasswordInput({
  name,
  label,
  isRequired = false,
  description,
  ...rest
}: FormPasswordInputProps & PasswordInputProps) {
  const { getInputProps, error } = useField(name);

  return (
    <PasswordInput
      label={label}
      withAsterisk={isRequired}
      description={description}
      error={error}
      {...getInputProps({
        id: name,
        ...rest,
      })}
    />
  );
}
