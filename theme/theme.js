import { colorsTuple, createTheme, CSSVariablesResolver } from "@mantine/core";
import { getSettings } from "../utils/settings";

const settings = getSettings();
const primaryColor = settings.theme?.colors?.primary_color || "#0FF0EB";

export const theme = createTheme({
  colors: {
    primary: colorsTuple(primaryColor)
  },
  defaultRadius: 10,
  components: {
    Container: {
      defaultProps: {
        size: 1400
      }
    },
    Anchor: {
      defaultProps: {
        td: "none",
      }
    },
    Title: {
      defaultProps: {
        c: "bright"
      }
    },
    Button: {
      defaultProps: {
        color: "var(--mantine-color-primary-5)",
        c: "var(--app-primary-contrast-color)",
      },
    },
    NumberFormatter: {
      defaultProps: {
        thousandSeparator: ",",
        decimalSeparator: ".",
        decimalScale: 2,
        prefix: settings.currency_symbol
      }
    },
    Modal: {
      defaultProps: {
        centered: true
      },
      styles: {
        header: {
          padding: "0 1rem",
        }
      }
    }
  }
});