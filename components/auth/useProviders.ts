"use client";

import { useEffect, useState } from "react";

export interface ProviderAvailability {
  google: boolean;
  facebook: boolean;
  firebase: boolean;
  sms: boolean;
  emailDelivery: boolean;
  loading: boolean;
}

const EMPTY: ProviderAvailability = {
  google: false,
  facebook: false,
  firebase: false,
  sms: false,
  emailDelivery: false,
  loading: true,
};

export function useProviders(): ProviderAvailability {
  const [state, setState] = useState<ProviderAvailability>(EMPTY);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const source = data.providers || data;
        setState({
          google: Boolean(source.google),
          facebook: Boolean(source.facebook),
          firebase: Boolean(source.firebase),
          sms: Boolean(source.sms),
          emailDelivery: Boolean(source.emailDelivery),
          loading: false,
        });
      })
      .catch(() => {
        if (active) setState({ ...EMPTY, loading: false });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
