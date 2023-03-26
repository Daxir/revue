import {
  Group,
  Image,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconPhotoCheck, IconPhotoPlus, IconPhotoX } from "@tabler/icons";
import { useState } from "react";
import { useField } from "remix-validated-form";

interface FormImageDropzoneProps {
  name: string;
  label: string;
}

export default function FormImageDropzone({
  name,
  label,
}: FormImageDropzoneProps) {
  const theme = useMantineTheme();
  const { error } = useField(name);
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const imageUrl = files.length > 0 ? URL.createObjectURL(files[0]) : null;

  return (
    <>
      <Group grow>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={files[0].name}
            imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
            radius="md"
          />
        ) : null}
        <Dropzone
          onDrop={setFiles}
          accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
          name={name}
          multiple={false}
          maxSize={5 * 1024 ** 2}
          //Unfortunately, the Dropzone does not bind to input[type=file] while dropping files
          //So we use it just as a button until browser drag and drop APIs are integrated into react-dropzone
          activateOnDrag={false}
          //This is needed to prevent the file being empty on Chromium browsers
          useFsAccessApi={false}
        >
          <Dropzone.Idle>
            <Stack align="center">
              <IconPhotoPlus size={48} />
              <Stack align="center" spacing="xs">
                <Title order={3}>Click here to select product image</Title>
                <Text color="dimmed" size="sm">
                  Accepts only PNG or JPEG files up to 5MB
                </Text>
              </Stack>
            </Stack>
          </Dropzone.Idle>
          <Dropzone.Accept>
            <Stack align="center">
              <IconPhotoCheck size={48} color={theme.colors.teal[5]} />
              <Stack align="center" spacing="xs">
                <Title order={3} color="teal">
                  Click here to select product image
                </Title>
                <Text color="dimmed" size="sm">
                  Accepts only PNG or JPEG files up to 5MB
                </Text>
              </Stack>
            </Stack>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Stack align="center">
              <IconPhotoX size={48} color={theme.colors.red[8]} />
              <Stack align="center" spacing="xs">
                <Title order={3} color="red.8">
                  Must be a photo
                </Title>
                <Text color="dimmed" size="sm">
                  Accepts{" "}
                  <Text inline component="span" color="red.7" underline>
                    only
                  </Text>{" "}
                  PNG or JPEG files up to 5MB
                </Text>
              </Stack>
            </Stack>
          </Dropzone.Reject>
        </Dropzone>
      </Group>
      {error ? <Text color="red.8">{error}</Text> : null}
    </>
  );
}
