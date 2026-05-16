"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  persistStorefrontConsentToDocument,
  readStorefrontConsentFromDocument,
} from "lib/consent/client";
import {
  createStorefrontConsentState,
  hasStoredConsentDecision,
  isAnalyticsConsentGranted,
  type StorefrontConsentState,
} from "lib/consent/shared";
import { CookieConsentBanner } from "./cookie-consent-banner";

type StorefrontConsentContextValue = {
  consent: StorefrontConsentState;
  analyticsEnabled: boolean;
  hasStoredDecision: boolean;
  openPreferences: () => void;
  grantAnalyticsConsent: () => void;
  denyAnalyticsConsent: () => void;
};

const StorefrontConsentContext =
  createContext<StorefrontConsentContextValue | null>(null);

type StorefrontConsentProviderProps = {
  children: ReactNode;
  initialConsent: StorefrontConsentState;
};

export function StorefrontConsentProvider({
  children,
  initialConsent,
}: StorefrontConsentProviderProps) {
  const initialState = useMemo(() => {
    const persisted =
      typeof document === "undefined"
        ? initialConsent
        : readStorefrontConsentFromDocument();

    return hasStoredConsentDecision(persisted) ? persisted : initialConsent;
  }, [initialConsent]);

  const [consent, setConsent] = useState<StorefrontConsentState>(initialState);
  const [isBannerOpen, setIsBannerOpen] = useState(
    !hasStoredConsentDecision(initialState),
  );

  const updateConsent = useCallback((nextConsent: StorefrontConsentState) => {
    setConsent(nextConsent);
    persistStorefrontConsentToDocument(nextConsent);
    setIsBannerOpen(false);
  }, []);

  const grantAnalyticsConsent = useCallback(() => {
    updateConsent(createStorefrontConsentState("granted"));
  }, [updateConsent]);

  const denyAnalyticsConsent = useCallback(() => {
    updateConsent(createStorefrontConsentState("denied"));
  }, [updateConsent]);

  const value = useMemo<StorefrontConsentContextValue>(
    () => ({
      consent,
      analyticsEnabled: isAnalyticsConsentGranted(consent),
      hasStoredDecision: hasStoredConsentDecision(consent),
      openPreferences: () => setIsBannerOpen(true),
      grantAnalyticsConsent,
      denyAnalyticsConsent,
    }),
    [consent, denyAnalyticsConsent, grantAnalyticsConsent],
  );

  return (
    <StorefrontConsentContext.Provider value={value}>
      {children}
      <CookieConsentBanner
        consent={consent}
        isOpen={isBannerOpen}
        onAcceptAnalytics={grantAnalyticsConsent}
        onDeclineAnalytics={denyAnalyticsConsent}
        onClose={() => setIsBannerOpen(false)}
      />
    </StorefrontConsentContext.Provider>
  );
}

export function useStorefrontConsent(): StorefrontConsentContextValue {
  const context = useContext(StorefrontConsentContext);

  if (!context) {
    throw new Error(
      "useStorefrontConsent must be used within StorefrontConsentProvider",
    );
  }

  return context;
}

export function useOptionalStorefrontConsent(): StorefrontConsentContextValue | null {
  return useContext(StorefrontConsentContext);
}
