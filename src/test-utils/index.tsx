import { render } from "ink-testing-library";
import { ReactElement } from "react";

type Instance = ReturnType<typeof render>;

export function renderAndAssert(
  tree: ReactElement,
  fn: (instance: Instance) => void,
) {
  const instance = render(tree);
  try {
    fn(instance);
  } finally {
    instance.unmount();
  }
}
