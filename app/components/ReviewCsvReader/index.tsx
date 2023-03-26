import { FileInput } from "@mantine/core";
import Papa, { RECORD_SEP, UNIT_SEP } from "papaparse";
import { useEffect, useState } from "react";
import { Country, ReviewCategory } from "~/utils";

const parseCountry = (country: string) => {
  switch (country.toUpperCase()) {
    case "UK":
    case "GB": {
      return Country.UK;
    }
    case "PL": {
      return Country.PL;
    }
    case "DE":
    case "DEU": {
      return Country.DE;
    }
  }
};

const stringToBoolean = (value = "") => {
  switch (value.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1": {
      return true;
    }
    case "false":
    case "no":
    case "0": {
      return false;
    }
  }
};

export interface LoadedReview {
  product: { name: string; countries: string[] };
  reviewContent: {
    description?: string;
    category?: ReviewCategory;
    advantages?: string;
    disadvantages?: string;
    grade?: number;
    language?: string;
    doubleQuality?: boolean;
    verified?: boolean;
    source?: string;
  };
}

export enum ParseReviewError {
  NO_HEADER = "NO_HEADER",
  DAMAGED_ROW = "DAMAGED_ROW",
  NO_PRODUCT_NAME = "NO_PRODUCT_NAME",
  NO_COUNTRY = "NO_COUNTRY",
  NO_RATING = "NO_RATING",
}

export interface CSVReaderProps {
  beforeFileLoad?: () => void;
  onFileLoad: (data: LoadedReview[]) => void;
  onError?: (error: ParseReviewError, row?: object) => void;
}

export default function ReviewCsvReader({
  beforeFileLoad = () => {},
  onFileLoad,
  onError = () => {},
}: CSVReaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (
    data: Papa.ParseResult<Record<string, string | undefined>>,
  ) => {
    beforeFileLoad();
    const result = data.data
      .map((element) => parseReview(element))
      .filter(
        (element) => element !== undefined && element !== null,
      ) as LoadedReview[];

    if (result.length === 0) {
      onError(ParseReviewError.NO_HEADER);
      onFileLoad([]);
      return;
    }
    onFileLoad(result);
  };

  const parseReview = (row: Record<string, string | undefined> | string[]) => {
    if (Array.isArray(row)) {
      onError(ParseReviewError.DAMAGED_ROW, row);
      return;
    }
    if (row.product_name === undefined || row.product_name === "") {
      onError(ParseReviewError.NO_PRODUCT_NAME, row);
      return;
    }
    if (row.product_origin === undefined || row.product_origin === "") {
      onError(ParseReviewError.NO_COUNTRY, row);
      return;
    }
    if (row.rating === undefined || row.rating === "") {
      onError(ParseReviewError.NO_RATING, row);
      return;
    }
    const result: LoadedReview = {
      product: {
        name: row.product_name,
        countries: row.product_origin
          .split(",")
          .map((element) => parseCountry(element))
          .filter((element) => element !== undefined) as Country[],
      },
      reviewContent: {},
    };

    if (row.content) result.reviewContent.description = row.content;
    if (
      row.category !== undefined &&
      Object.values(ReviewCategory).includes(row.category as ReviewCategory)
    ) {
      result.reviewContent.category = row.category as ReviewCategory;
    }
    if (row.advantages) result.reviewContent.advantages = row.advantages;
    if (row.disadvantages) {
      result.reviewContent.disadvantages = row.disadvantages;
    }
    if (row.rating && !Number.isNaN(row.rating)) {
      result.reviewContent.grade = Number(row.rating);
    }
    if (row.language === "DEU") result.reviewContent.language = "DE";
    else if (row.language) result.reviewContent.language = row.language;
    result.reviewContent.doubleQuality =
      row.doubleQuality === undefined || row.doubleQuality === ""
        ? false
        : stringToBoolean(row.doubleQuality);
    result.reviewContent.advantages = row.advantages;
    result.reviewContent.disadvantages = row.disadvantages;
    result.reviewContent.verified = stringToBoolean(row.verified);
    if (row.product_source) result.reviewContent.source = row.product_source;

    return result;
  };

  useEffect(() => {
    if (file === null) return;
    Papa.parse(file, {
      header: true,
      delimitersToGuess: [";", "|", RECORD_SEP, UNIT_SEP, ",", "	"],
      complete: handleUpload,
    });
  }, [file]);

  return (
    <FileInput
      data-testid="load-csv-button"
      label="Upload CSV file"
      placeholder="Choose file"
      value={file}
      onChange={setFile}
      withAsterisk
      multiple={false}
    />
  );
}
