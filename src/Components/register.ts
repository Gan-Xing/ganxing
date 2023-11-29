import { components } from "./getItems";

export const GXUI = () => {
  components.forEach(({ tagName, element }) => {
    if (element && !customElements.get(tagName)) {
      customElements.define(tagName, element);
    }
  });
};
