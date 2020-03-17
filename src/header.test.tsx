import { render } from "@testing-library/react";
import * as React from "react";
import Header from "./header";

describe(Header, () => {
  test("snapshot", () => {
    const { asFragment } = render(<Header />);
    expect(asFragment()).toMatchSnapshot();
  });
});
