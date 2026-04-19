import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    accent: {
      500: "#FF6B8A",
    },
    role: {
      student: "#FF6B8A",
      alumni: "#805AD5",
      admin: "#DD6B20",
    },
  },
  fonts: {
    heading: "'DM Sans', system-ui, sans-serif",
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.700",
      },
    },
  },
  radii: {
    card: "xl",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "teal",
      },
    },
  },
});

export default theme;
