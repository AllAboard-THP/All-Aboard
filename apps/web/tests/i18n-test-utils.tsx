import type { ReactElement, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, type RenderOptions } from "@testing-library/react";

import frMessages from "../messages/fr.json";

type Props = {
  children: ReactNode;
  locale?: "fr" | "en";
};

function I18nTestProvider({ children, locale = "fr" }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={frMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithI18n(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { locale?: "fr" | "en" },
) {
  const { locale = "fr", ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <I18nTestProvider locale={locale}>{children}</I18nTestProvider>
    ),
    ...renderOptions,
  });
}
