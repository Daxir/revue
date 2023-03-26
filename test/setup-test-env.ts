import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/extend-expect";
import matchers from "@testing-library/jest-dom/matchers";

installGlobals();
expect.extend(matchers);
