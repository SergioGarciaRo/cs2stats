import { parseStringPromise } from 'xml2js';

async function fetchText(url: string, headers?: Record<string, string>) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36', ...headers },
  });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return res.text();
}

// ─── Steam Profile ────────────────────────────────────────────────────────────

export async function fetchSteamProfile(steamId: string) {
  try {
    const xml = await fetchText(`https://steamcommunity.com/profiles/${steamId}?xml=1`);
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const p = parsed.profile || {};
    return {
      ok: true,
      profile: {
        steamId,
        name: p.steamID || null,
        avatar: p.avatarFull || p.avatar || null,
        visibility: p.privacyState || 'unknown',
        memberSince: p.memberSince || null,
        vacBanned: p.vacBanned === '1' || p.vacBanned === 'true',
        tradeBanState: p.tradeBanState || null,
      },
    };
  } catch {
    try {
      const html = await fetchText(`https://steamcommunity.com/profiles/${steamId}`);
      const nameMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
      const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
      const vis = /profile_private|private profile/i.test(html) ? 'private' : 'public';
      return {
        ok: true,
        profile: {
          steamId,
          name: nameMatch?.[1] ?? null,
          avatar: imgMatch?.[1] ?? null,
          visibility: vis,
          memberSince: null,
          vacBanned: false,
          tradeBanState: null,
        },
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
}

// ─── CS2 Hours (appID 730) ─────────────────────────────────────────────────

export async function fetchCS2Hours(steamId: string) {
  try {
    const html = await fetchText(
      `https://steamcommunity.com/profiles/${steamId}/games/?tab=all`
    );

    // Steam embeds game list as a JS variable:
    // var rgGames = [{...},{appid:730,...,"hours_forever":"1,234",...},...];
    const jsonMatch = html.match(/var rgGames\s*=\s*(\[[\s\S]*?\]);/);
    if (jsonMatch) {
      try {
        const games: Array<{ appid: number; name: string; hours_forever?: string; hours?: number }> =
          JSON.parse(jsonMatch[1]);
        const cs2 = games.find((g) => g.appid === 730);
        if (cs2) {
          const hrs = cs2.hours_forever ?? (cs2.hours ? String(cs2.hours) : null);
          if (hrs) return { ok: true, hours: hrs.replace(/,/g, '') + ' hrs' };
        }
        return { ok: false, reason: 'CS2 not found in game list (may not own or 0 hours)' };
      } catch {
        // JSON parse failed, fall through to regex
      }
    }

    // Fallback: plain text regex (old layout)
    const m = /(Counter-Strike 2|Counter-Strike: Global Offensive)[\s\S]{0,200}?([0-9][0-9,]*\.?[0-9]*) hrs/i.exec(html);
    if (m) return { ok: true, hours: m[2].replace(/,/g, '') + ' hrs' };

    return { ok: false, reason: 'Profile may be private or game list hidden' };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

// ─── Faceit Level ──────────────────────────────────────────────────────────

export async function fetchFaceitLevel(steamId: string) {
  // Method 1: official free API (requires FACEIT_API_KEY env var)
  const apiKey = process.env.FACEIT_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      if (res.ok) {
        const j = await res.json();
        const level = j?.games?.cs2?.skill_level ?? j?.games?.csgo?.skill_level ?? null;
        const elo = j?.games?.cs2?.faceit_elo ?? j?.games?.csgo?.faceit_elo ?? null;
        const faceitName = j?.nickname ?? null;
        if (level !== null) return { ok: true, level, elo, faceitName };
      }
    } catch {}
  }

  // Method 2: unofficial endpoint (no key needed, may be unstable)
  try {
    const res = await fetch(
      `https://api.faceit.com/search/v1/players?nickname=${steamId}&game=cs2&offset=0&limit=5`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const j = await res.json();
      const items: any[] = j?.payload?.results ?? [];
      // Look for player whose steam_id matches
      const match = items.find((p: any) =>
        p.steam_id === steamId || p.game_player_id === steamId
      );
      if (match) {
        return {
          ok: true,
          level: match.skill_level ?? match.games?.[0]?.skill_level ?? null,
          elo: match.faceit_elo ?? null,
          faceitName: match.nickname ?? null,
        };
      }
    }
  } catch {}

  // Method 3: try the player lookup by steam id via unofficial endpoint
  try {
    const res = await fetch(
      `https://api.faceit.com/users/v1/steam/${steamId}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const j = await res.json();
      const payload = j?.payload;
      if (payload) {
        const cs2 = payload.games?.cs2 ?? payload.games?.csgo;
        return {
          ok: true,
          level: cs2?.skill_level ?? null,
          elo: cs2?.faceit_elo ?? null,
          faceitName: payload.nickname ?? null,
        };
      }
    }
  } catch {}

  return { ok: false, reason: apiKey ? 'not_found' : 'no_api_key' };
}

// ─── Vanity URL resolver ───────────────────────────────────────────────────

export async function resolveVanity(vanity: string) {
  try {
    const xml = await fetchText(`https://steamcommunity.com/id/${encodeURIComponent(vanity)}?xml=1`);
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const p = parsed.profile || {};
    if (p.steamID64) return { ok: true, steamId: p.steamID64 };
    return { ok: false, error: 'could_not_resolve' };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── CS2 Medals (game badges for appID 730) ───────────────────────────────

export async function fetchCS2Medals(steamId: string) {
  try {
    const html = await fetchText(`https://steamcommunity.com/profiles/${steamId}/badges/`);

    if (/profile_private|This profile is private/i.test(html)) {
      return { ok: false, reason: 'private' };
    }

    const medals: Array<{ name: string; xp: string; level: string; icon: string; unlocked: string }> = [];

    // Split into badge blocks
    const blocks: string[] = [];
    let start = 0;
    while (true) {
      const idx = html.indexOf('<div class="badge_row', start);
      if (idx === -1) break;
      const next = html.indexOf('<div class="badge_row', idx + 50);
      blocks.push(html.substring(idx, next === -1 ? idx + 4000 : next));
      start = idx + 50;
    }

    for (const block of blocks) {
      // Only CS2 related: must link to /badges/730 OR mention Counter-Strike / Operation
      const isCS2 = /\/badges\/730(?:[^0-9]|$)|counter-strike|operation/i.test(block);
      if (!isCS2) continue;

      const name = block.match(/badge_info_title[^>]*>\s*([^<]+)/)?.[1]?.trim();
      if (!name) continue;

      const xp = block.match(/([0-9,]+)\s*XP/)?.[1]?.replace(/,/g, '') ?? '0';
      const level = block.match(/Level\s*(\d+)/i)?.[1] ?? '1';
      const icon = block.match(/data-delayed-image="([^"]+)"/)?.[1]
        ?? block.match(/class="badge_icon[^>]*src="([^"]+)"/)?.[1]
        ?? block.match(/<img[^>]+src="(https:\/\/(?:cdn|community)[^"]+\/items\/730\/[^"]+)"/i)?.[1]
        ?? block.match(/<img[^>]+src="(https:\/\/(?:cdn|community)[^"]+\/(?:badges|public)[^"]+\.(?:png|jpg))"/i)?.[1]
        ?? '';
      const unlocked = block.match(/badge_info_unlocked[^>]*>\s*([^<]+)/)?.[1]?.trim() ?? '';

      medals.push({ name, xp, level, icon, unlocked });
    }

    return { ok: true, medals };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

// ─── CS2 Inventory Value ───────────────────────────────────────────────────

export async function fetchInventoryValue(steamId: string) {
  try {
    // Fetch inventory (assets + descriptions in one call)
    const res = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' } }
    );
    if (res.status === 403) return { ok: false, reason: 'private' };
    if (!res.ok) return { ok: false, reason: `inventory_error_${res.status}` };

    const data = await res.json();
    if (!data.descriptions) return { ok: false, reason: 'no_descriptions' };

    const totalItems: number = data.total_inventory_count ?? 0;

    // Build map: classid+instanceid → market_hash_name, count
    const descMap = new Map<string, string>();
    for (const d of data.descriptions) {
      if (d.marketable === 1 && d.market_hash_name) {
        descMap.set(`${d.classid}_${d.instanceid}`, d.market_hash_name);
      }
    }

    // Count occurrences of each market_hash_name
    const itemCount = new Map<string, number>();
    for (const asset of (data.assets ?? [])) {
      const key = `${asset.classid}_${asset.instanceid}`;
      const name = descMap.get(key);
      if (name) itemCount.set(name, (itemCount.get(name) ?? 0) + 1);
    }

    // Fetch prices sequentially in small batches to avoid Steam market rate limit (429)
    const uniqueNames = [...itemCount.keys()].slice(0, 20);
    let totalUSD = 0;
    let priced = 0;

    for (const name of uniqueNames) {
      try {
        const pr = await fetch(
          `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(name)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' } }
        );
        if (pr.status === 429) break; // rate limited — stop early with partial result
        if (!pr.ok) continue;
        const pj = await pr.json();
        const priceStr: string = pj.median_price ?? pj.lowest_price ?? '';
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(price)) {
          totalUSD += price * (itemCount.get(name) ?? 1);
          priced++;
        }
        // Small delay between requests to respect rate limits
        await new Promise(r => setTimeout(r, 200));
      } catch {}
    }

    return {
      ok: true,
      totalItems,
      marketableItems: itemCount.size,
      pricedItems: priced,
      approximateValueUSD: Math.round(totalUSD * 100) / 100,
      isPartial: uniqueNames.length < itemCount.size,
    };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

// ─── Leetify Rating ────────────────────────────────────────────────────────

export async function fetchLeetifyRating(steamId: string) {
  try {
    const res = await fetch(`https://api.leetify.com/api/profile/${steamId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    if (res.status === 404) return { ok: false, reason: 'no_leetify_data' };
    if (!res.ok) return { ok: false, reason: `leetify_${res.status}` };

    const j = await res.json();
    const r = j?.leetifyRatings;

    if (!r) return { ok: false, reason: 'no_ratings' };

    return {
      ok: true,
      aim:         typeof r.aim         === 'number' ? Math.round(r.aim)         : null,
      positioning: typeof r.positioning === 'number' ? Math.round(r.positioning) : null,
      utility:     typeof r.utility     === 'number' ? Math.round(r.utility)     : null,
      overall:     typeof r.overall     === 'number' ? Math.round(r.overall)
                 : typeof j?.appRating  === 'number' ? Math.round(j.appRating)   : null,
    };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}
