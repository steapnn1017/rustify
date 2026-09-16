"use client";

import { Unplug } from "lucide-react";
import { connectString, steamConnectUri } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export function ConnectButton({ host, port }: { host: string; port: number }) {
  const t = useT();
  return (
    <a className="btn btn-primary" href={steamConnectUri(host, port)}>
      <Unplug size={16} strokeWidth={1.5} />
      {t("connect")}
    </a>
  );
}

export function ConnectRow({ host, port }: { host: string; port: number }) {
  const raw = connectString(host, port);
  return (
    <div className="actions">
      <ConnectButton host={host} port={port} />
      <span className="mono" style={{ alignSelf: "center" }}>
        {raw}
      </span>
    </div>
  );
}
