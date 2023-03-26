import type { FileInputProps } from "@mantine/core";
import { FileInput } from "@mantine/core";
import { useField } from "remix-validated-form";

interface FormFileInputProps {
  name: string;
  label: string;
}

export default function FormFileInput({
  name,
  label,
  ...rest
}: FormFileInputProps & FileInputProps<false>) {
  const { error } = useField(name);
  return (
    <FileInput
      label={label}
      error={error}
      multiple={false}
      name={name}
      {...rest}
    />
  );
}
