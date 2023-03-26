import { MultiSelect, NativeSelect } from "@mantine/core";
import type { MultiSelectProps } from "@mantine/core";
import { useState } from "react";
import { ClientOnly } from "remix-utils";
import { useField } from "remix-validated-form";

interface FormMultiSelectProps {
  name: string;
  label: string;
  description?: string;
}

export default function FormMultiSelect({
  name,
  label,
  description,
  ...rest
}: FormMultiSelectProps & MultiSelectProps) {
  const [value, setValue] = useState<string[]>([]);
  const { getInputProps, error } = useField(name);

  return (
    <ClientOnly
      fallback={
        <NativeSelect
          label={label}
          description={description}
          data={rest.data}
        />
      }
    >
      {() => (
        <>
          <MultiSelect
            label={label}
            description={description}
            value={value}
            onChange={setValue}
            {...rest}
            error={error}
          />
          {value.map((item) => (
            <input
              key={item}
              type="hidden"
              name={name}
              value={item}
              {...getInputProps({
                id: name,
              })}
            />
          ))}
        </>
      )}
    </ClientOnly>
  );
}
