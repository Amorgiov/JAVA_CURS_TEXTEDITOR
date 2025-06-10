import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    light: {
      background: "#FFFFFF",
      text: "#1A202C",
      primary: "#3182CE",
      accent: "#2B6CB0",
      error: "#E53E3E",
      success: "#38A169",
      border: "#E2E8F0",
      shadow: "#CBD5E0",
    },
    dark: {
      background: "#1A202C",
      text: "#E2E8F0",
      primary: "#63B3ED",
      accent: "#3182CE",
      error: "#F56565",
      success: "#48BB78",
      border: "#4A5568",
      shadow: "#2D3748",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "light" ? "light.background" : "dark.background",
        color: props.colorMode === "light" ? "light.text" : "dark.text",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        bg: "transparent",
        transition: "all 0.2s",
        _hover: {
          bg: "accent",
          color: "white",
        },
        _active: {
          bg: "primary",
        },
      },
    },
  },
});

export default theme;
