import type { ReactElement } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, type RenderOptions } from "@testing-library/react";

import enMessages from "../messages/en.json";
import frMessages from "../messages/fr.json";

const messagesByLocale = {
  fr: frMessages,
  en: enMessages,
} as const;

type Locale = keyof typeof messagesByLocale;

export function renderWithIntl(
  ui: ReactElement,
  { locale = "fr", ...options }: RenderOptions & { locale?: Locale } = {},
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
      {ui}
    </NextIntlClientProvider>,
    options,
  );
}

export function createServerTranslator(namespace: string, locale: Locale = "fr") {
  const messages = messagesByLocale[locale] as Record<
    string,
    Record<string, string>
  >;

  return (key: string, values?: Record<string, string | number>) => {
    let message = messages[namespace]?.[key] ?? key;
    if (values) {
      for (const [name, value] of Object.entries(values)) {
        message = message.replace(`{${name}}`, String(value));
      }
    }
    return message;
  };
}
