export const fontSizes = {
  small: 11,
  caption: 12,
  body: 14,
  subtitle: 15,
  title: 17,
  heading: 22,
  display: 32,
} as const;

export const lineHeights = {
  small: 14,
  caption: 16,
  body: 20,
  subtitle: 22,
  title: 24,
  heading: 28,
  display: 38,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;

export const typography = {
  display: {
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontWeight: fontWeights.heavy,
  },
  heading: {
    fontSize: fontSizes.heading,
    lineHeight: lineHeights.heading,
    fontWeight: fontWeights.heavy,
  },
  title: {
    fontSize: fontSizes.title,
    lineHeight: lineHeights.title,
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    fontSize: fontSizes.subtitle,
    lineHeight: lineHeights.subtitle,
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontWeight: fontWeights.medium,
  },
  small: {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeights.medium,
  },
} as const;
