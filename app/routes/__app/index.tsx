import {
  Anchor,
  Center,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import type { RefObject } from "react";
import { useRef } from "react";
import { useCountUp } from "react-countup";

export default function HomePage() {
  const theme = useMantineTheme();
  const productCounterReference = useRef<HTMLHeadingElement>(null);
  const reviewCounterReference = useRef<HTMLHeadingElement>(null);
  const userCounterReference = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  useCountUp({
    ref: productCounterReference as RefObject<HTMLElement>,
    end: 4674,
    duration: prefersReducedMotion ? 0 : 5,
    useEasing: true,
  });
  useCountUp({
    ref: reviewCounterReference as RefObject<HTMLElement>,
    end: 12_853,
    duration: prefersReducedMotion ? 0 : 5,
    useEasing: true,
  });
  useCountUp({
    ref: userCounterReference as RefObject<HTMLElement>,
    end: 7238,
    duration: prefersReducedMotion ? 0 : 5,
    useEasing: true,
  });

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "80%",
      }}
      justify="center"
      mx="auto"
    >
      <Center>
        <svg
          width="452"
          height="256"
          viewBox="0 0 166 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.colors.blue[9]} />
              <stop offset="100%" stopColor={theme.colors.teal[6]} />
            </linearGradient>
          </defs>
          <path
            id="homepage-logo"
            d="M2 62C3.93323 61.7584 3.97382 39.3565 4 37C4.11237 26.8866 3.24099 15.5357 5.05556 5.55556C6.11867 -0.291552 13.2073 1.65921 16.8889 3.50001C25.4917 7.8014 24.2389 20.7986 22 28.2222C20.5323 33.0888 17.849 36.5697 14.0556 39.8889C12.6544 41.1149 10.2165 40.228 9.22222 41.2222C9.0552 41.3892 19.3902 56.088 20.5 57.4445C24.2088 61.9775 26.3565 50.287 27.5 48C31.0512 40.8976 32.1218 41.8035 39 42C41.7948 42.0799 52.6672 40.4578 49.7778 35C47.5307 30.7556 40.1627 37.8373 38.5 39.5C31.0704 46.9296 37.4627 59 47.2222 59C57.5137 59 60.3453 47.7568 62.5 40C62.9976 38.2085 63 34.4445 63 34.4445C63 34.4445 64 38.1184 64 40C64 45.8208 65.7825 55.35 68.5556 60.5C71.2394 65.4843 71.1961 65.1522 73.5556 61.4445C77.072 55.9186 79.4393 49.3023 81.7778 43.2222C82.2724 41.9361 84.7499 36 86 36C90.402 36 91.7668 37.9865 95.5 35C96.7268 34.0185 96.0729 32.7211 96 36.2222C95.89 41.5033 95 46.704 95 52C95 56.4523 98.4673 59.7923 103 57.7778C110.602 54.3991 112 26.181 112 34.5C112 40.7701 110 47.3936 110 53.8889C110 57.3879 113.903 62.6952 117 58.2222C120.496 53.1722 122.204 47.4344 124.778 42C126.413 38.5477 134.173 45.3207 138.5 44.9445C142.423 44.6033 152.663 32.8975 147.444 31C140.057 28.3138 135.028 31.6059 132 38.7778C129.107 45.6308 127.565 50.9964 131.5 57.5556C140.708 72.9026 153.6 64.4 164 54"
            stroke="url(#linear)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </Center>
      <Title
        align="center"
        sx={{
          fontSize: "3.5rem",
        }}
      >
        A place where your opinion{" "}
        <Text
          component="span"
          variant="gradient"
          gradient={{ from: "teal.6", to: "blue.9" }}
          inherit
        >
          matters
        </Text>
        .
      </Title>
      <Group grow spacing="xl" mt="10rem">
        <Stack>
          <Title
            align="center"
            size="xl"
            variant="gradient"
            sx={{
              fontSize: "6rem",
            }}
            gradient={{ from: "teal.6", to: "blue.9" }}
            ref={productCounterReference}
          >
            4674
          </Title>
          <Title align="center" order={1}>
            Categorized, searchable and detailed{" "}
            <Anchor component={Link} to="/products">
              products
            </Anchor>
          </Title>
        </Stack>
        <Stack>
          <Title
            align="center"
            size="xl"
            variant="gradient"
            sx={{
              fontSize: "6rem",
            }}
            gradient={{ from: "teal.6", to: "blue.9" }}
            ref={reviewCounterReference}
          >
            12853
          </Title>
          <Title align="center" order={1}>
            Moderated, extensive and detailed{" "}
            <Anchor component={Link} to="/reviews">
              reviews
            </Anchor>
          </Title>
        </Stack>
        <Stack>
          <Title
            align="center"
            size="xl"
            variant="gradient"
            sx={{
              fontSize: "6rem",
            }}
            gradient={{ from: "teal.6", to: "blue.9" }}
            ref={userCounterReference}
          >
            7238
          </Title>
          <Title align="center" order={1}>
            Conscious, satisfied and responsible{" "}
            <Text component="span" color={theme.colors.teal[4]} inherit>
              users
            </Text>
          </Title>
        </Stack>
      </Group>
    </Stack>
  );
}
