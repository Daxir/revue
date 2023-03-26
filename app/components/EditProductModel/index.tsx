import type { ModalProps } from "@mantine/core";
import {
  Button,
  Center,
  Image,
  Modal,
  MultiSelect,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { ProductCategory } from "@prisma/client";
import { withYup } from "@remix-validated-form/with-yup";
import { useEffect } from "react";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import * as yup from "yup";
import type { ProductWithContent } from "~/models/product.server";

export const validator = withYup(
  yup.object({
    name: yup.string().min(2).required(),
    category: yup.mixed().oneOf(Object.values(ProductCategory)).required(),
    content: yup.object({
      manufacturer: yup.string().min(2).required(),
    }),
  }),
);

export type EditProductModalProps = Omit<ModalProps, "children"> & {
  product?: ProductWithContent;
};

export default function EditProductModal({
  product,
  ...modalProps
}: EditProductModalProps) {
  const formData = useFormContext("formid");
  useEffect(() => {
    if (product) {
      formData.reset();
    }
  }, [formData, product]);

  const categories = Object.values(ProductCategory).map((category) => ({
    value: category,
    label: upperFirst(category.replace("_", " ").toLowerCase()),
  }));

  const countries = [
    { label: "Poland", value: "PL" },
    { label: "Germany", value: "DE" },
    { label: "Great Britain", value: "UK" },
  ];

  return (
    <Modal {...modalProps}>
      <ValidatedForm
        validator={validator}
        method="post"
        onSubmit={async (data) => {
          const { error } = await validator.validate(data);
          if (error === undefined) {
            modalProps.onClose();
          }
        }}
      >
        <input type="hidden" name="productId" value={product?.productId} />
        <input
          type="hidden"
          name="content.features_list"
          value={JSON.stringify(product?.content.features_list)}
        />
        <input
          type="hidden"
          name="content.linked_products"
          value={JSON.stringify(product?.content.linked_products)}
        />
        <input
          type="hidden"
          name="content.media"
          value={product?.content.media}
        />

        <Center>
          <Image width="20rem" height="20rem" src={product?.content?.media} />
        </Center>
        <TextInput
          label="Name"
          withAsterisk
          name="name"
          defaultValue={product?.name}
        />
        <TextInput
          label="Manufacturer"
          name="content.manufacturer"
          defaultValue={product?.content.manufacturer}
          withAsterisk
        />
        <Textarea
          label="Description"
          name="content.description"
          defaultValue={product?.content.description}
        />
        <Select
          label="Category"
          searchable
          name="category"
          data={categories}
          defaultValue={product?.category}
          withAsterisk
        />
        <MultiSelect
          label="Countries"
          name="content.countries"
          defaultValue={product?.content.countries}
          data={countries}
          withAsterisk
        />
        <Button name="intent" value="edit" type="submit">
          Submit
        </Button>
      </ValidatedForm>
    </Modal>
  );
}
