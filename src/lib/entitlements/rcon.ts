import net from "node:net";
import { rconFromEnv } from "@/lib/live/catalog";
import { grantServerIds, inGameGroups, type StoreTierId } from "@/lib/store/catalog";

export type GrantCommand = {
  steamId: string;
  serverId: string;
  tier: StoreTierId;
  durationDays: number;
};

export type GrantResult = {
  ok: boolean;
  mode: "queued" | "sent" | "failed";
  steamId: string;
  groups: string[];
  commands: string[];
  detail: string;
};

export interface GameGrantAdapter {
  grant(command: GrantCommand): Promise<GrantResult>;
}

function encodePacket(id: number, type: number, body: string) {
  const payload = Buffer.from(body, "utf8");
  const size = 4 + 4 + payload.length + 2;
  const buffer = Buffer.alloc(4 + size);
  buffer.writeInt32LE(size, 0);
  buffer.writeInt32LE(id, 4);
  buffer.writeInt32LE(type, 8);
  payload.copy(buffer, 12);
  return buffer;
}

async function sendSourceRcon(host: string, port: number, password: string, command: string) {
  return new Promise<string>((resolve, reject) => {
    const socket = net.connect({ host, port });
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("RCON timed out"));
    }, 5000);

    socket.once("connect", () => {
      socket.write(encodePacket(1, 3, password));
    });
    socket.on("data", (data) => {
      chunks.push(data);
      const buffer = Buffer.concat(chunks);
      if (buffer.length < 12) return;
      const type = buffer.readInt32LE(8);
      if (type === 2 && buffer.readInt32LE(4) === -1) {
        clearTimeout(timeout);
        socket.destroy();
        reject(new Error("RCON auth failed"));
        return;
      }
      if (type === 2) {
        chunks.length = 0;
        socket.write(encodePacket(2, 2, command));
        return;
      }
      if (type === 0 && buffer.readInt32LE(4) === 2) {
        const body = buffer.subarray(12, buffer.length - 2).toString("utf8");
        clearTimeout(timeout);
        socket.end();
        resolve(body);
      }
    });
    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

export class OxideCarbonRconAdapter implements GameGrantAdapter {
  async grant(command: GrantCommand): Promise<GrantResult> {
    const groups = inGameGroups(command.tier);
    const targets = grantServerIds(command.tier, command.serverId);
    const commands = targets.flatMap((serverId) =>
      groups.map((group) => `[${serverId}] oxide.usergroup add ${command.steamId} ${group}`),
    );

    const configured = targets
      .map((serverId) => ({ serverId, rcon: rconFromEnv(serverId) }))
      .filter((item): item is { serverId: string; rcon: NonNullable<ReturnType<typeof rconFromEnv>> } =>
        Boolean(item.rcon),
      );

    if (configured.length === 0) {
      return {
        ok: true,
        mode: "queued",
        steamId: command.steamId,
        groups,
        commands,
        detail: `Linked to SteamID64 ${command.steamId}. Plugin poll /api/game/entitlements will apply ${groups.join(", ")} on ${targets.join(", ")}.`,
      };
    }

    try {
      for (const target of configured) {
        for (const group of groups) {
          await sendSourceRcon(
            target.rcon.host,
            target.rcon.port,
            target.rcon.password,
            `oxide.usergroup add ${command.steamId} ${group}`,
          );
        }
      }
      return {
        ok: true,
        mode: "sent",
        steamId: command.steamId,
        groups,
        commands,
        detail: `Granted ${groups.join(", ")} in-game to SteamID64 ${command.steamId} on ${configured.map((item) => item.serverId).join(", ")}.`,
      };
    } catch (error) {
      return {
        ok: false,
        mode: "failed",
        steamId: command.steamId,
        groups,
        commands,
        detail: error instanceof Error ? error.message : "RCON grant failed",
      };
    }
  }
}
