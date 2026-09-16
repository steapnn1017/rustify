import { Unplug } from "lucide-react";
import { connectString, steamConnectUri } from "@/lib/format";

export function ConnectButton({ host, port }: { host: string; port: number }) {
  return (
    <a className="btn btn-primary" href={steamConnectUri(host, port)}>
      <Unplug size={16} strokeWidth={1.5} />
      Connect
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
