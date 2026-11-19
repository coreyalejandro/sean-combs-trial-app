"""Pack the Sexual Assault Migration Map's simulation for the Combs Trial app (visualization 29, /finale/).

Input: the migration-map build (default /mnt/user-data/outputs/migration-map/build), whose stage 6 wrote
viewer/data/meta.json + viewer/data/march.bin (7.2 MB of float32/int32 arrays) and whose stage 5 wrote
outputs/metrics/report.json.

Output (run from the repo root):
  public/finale-data/march.qbin   the same simulation, quantized to small integers and gzip-compressed
                                  (the browser inflates it with DecompressionStream). Every quantization
                                  step is listed in meta.json "q" and checked by src/viz/finale/engine.test.ts.
  public/finale-data/meta.json    what the map's panels need at run time (curves, jobs, counties, outlines)
  public/finale-data/still-arcs.png  the still map (state-to-D.C. arcs), for readers without JavaScript
  public/finale-data/homes.png    every walker at home on Day 1 (the verdict page's last frame)
  src/viz/finale/summary.json     the numbers the server-rendered page prints (text version, sources)

Nothing here is invented: every value is read from the migration build's own outputs.

  python3 src/viz/finale/prep/prepare_finale_data.py [path/to/migration-map/build]
"""
import gzip
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image, ImageDraw

BUILD = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/mnt/user-data/outputs/migration-map/build")
REPO = Path(__file__).resolve().parents[4]
PUB = REPO / "public" / "finale-data"
SUMMARY = REPO / "src" / "viz" / "finale" / "summary.json"

# Quantization steps (units of the stored integers)
DIST_STEP_KM = 0.01        # node distance to the Mall, total route length: 10 m
CONN_STEP_KM = 0.05        # first leg from home to the road: 50 m
SEG_STEP_KM = 0.02         # where a wait begins: 20 m
DAILY_STEP_KM = 0.1        # daily walking distance (the simulation draws it in 0.1 km steps)
ARRIVE_STEPS_PER_DAY = 64  # arrival time: 22.5 minutes
COORD_MAX = 65535
NO_COUNTY = 65535


def load_viewer():
    meta = json.loads((BUILD / "viewer" / "data" / "meta.json").read_text())
    buf = (BUILD / "viewer" / "data" / "march.bin").read_bytes()
    types = {"f4": "<f4", "i4": "<i4", "i2": "<i2", "u2": "<u2", "u1": "u1"}
    arrays = {a["name"]: np.frombuffer(buf, dtype=types[a["type"]], count=a["count"], offset=a["offset"])
              for a in meta["layout"]}
    return meta, arrays


def quantize_coords(lon, lat):
    box = [float(np.floor(lon.min() * 100) / 100), float(np.floor(lat.min() * 100) / 100),
           float(np.ceil(lon.max() * 100) / 100), float(np.ceil(lat.max() * 100) / 100)]
    qx = np.round((lon - box[0]) / (box[2] - box[0]) * COORD_MAX).astype("<u2")
    qy = np.round((lat - box[1]) / (box[3] - box[1]) * COORD_MAX).astype("<u2")
    return box, qx, qy


def pack(meta, D):
    NN = D["node_lon"].size
    par = D["node_parent"].astype(np.int64)
    idx = np.arange(NN)
    assert par[0] == -1 and (par[1:] < idx[1:]).all(), "route tree must list each parent before its children"

    node_box, nx, ny = quantize_coords(D["node_lon"], D["node_lat"])
    qdist = np.round(D["node_dist"].astype(np.float64) / DIST_STEP_KM).astype(np.int64)
    edge = np.where(par >= 0, qdist - qdist[np.maximum(par, 0)], qdist)
    assert edge.min() >= 0 and edge.max() < 65536
    par_delta = np.where(par >= 0, idx - par, 0)
    load = D["node_load"].astype(np.float64)
    max_load = float(load.max())
    corridor_min = 20  # viewer rule: road stretches that 20,000+ people pass along (20 dots)
    width_code = np.where(load >= corridor_min, np.maximum(1, np.round(np.sqrt(load / max_load) * 255)), 0).astype("u1")
    cty = np.where(D["node_county"] < 0, NO_COUNTY, D["node_county"].astype(np.int64)).astype("<u2")

    air = D["dot_air"].astype(bool)
    dot_box, dx, dy = quantize_coords(D["dot_lon"], D["dot_lat"])
    conn_q = np.round(D["dot_conn"].astype(np.float64) / CONN_STEP_KM).astype(np.int64)
    assert conn_q.max() < 65536
    zone_q = int(round(meta["arrival_zone_km"] / DIST_STEP_KM))
    total_q = np.round(D["dot_total"].astype(np.float64) / DIST_STEP_KM).astype(np.int64)
    conn_in_dist = np.round(conn_q * CONN_STEP_KM / DIST_STEP_KM).astype(np.int64)
    resid = total_q - (conn_in_dist + qdist[D["dot_node"]] - zone_q)
    resid[air] = 0  # flying walkers never use their road distance
    assert np.abs(resid).max() < 32768
    daily_q = np.round((D["dot_daily"].astype(np.float64) - 12.0) / DAILY_STEP_KM)
    daily_min = 12.0
    assert daily_q.min() >= 0 and daily_q.max() < 256
    arr_q = np.round(D["dot_arrive"].astype(np.float64) * ARRIVE_STEPS_PER_DAY)
    assert arr_q.max() < 65536
    flags = (D["dot_rest"].astype(np.int64) | (air.astype(np.int64) << 3)).astype("u1")
    seg_s_q = np.round(D["seg_s"].astype(np.float64) / SEG_STEP_KM)
    assert seg_s_q.max() < 65536 and D["seg_day"].max() < 256
    assert D["dot_segcnt"].max() < 256

    # (name, array, encoding). "parent": stored as (value - value of the parent node) mod 2^bits, which is
    # small along a road; "prev": (value - previous value) mod 2^bits. Multi-byte arrays are stored
    # byte-planar (all low bytes, then the next byte, ...), which gzip compresses much better.
    arrays = [
        ("node_up", par_delta.astype("<u4"), "plain"),        # index minus parent index (0 for the Mall)
        ("node_x", nx, "parent"), ("node_y", ny, "parent"),
        ("node_edge", edge.astype("<u2"), "plain"),           # road length to the parent, in DIST_STEP_KM
        ("node_county", cty, "parent"),
        ("node_width", width_code, "plain"),                  # corridor width code (0 = not drawn)
        ("dot_x", dx, "plain"), ("dot_y", dy, "plain"),
        ("dot_node", D["dot_node"].astype("<u4"), "prev"),
        ("dot_conn", conn_q.astype("<u2"), "plain"),
        ("dot_resid", resid.astype("<i2"), "plain"),
        ("dot_daily", daily_q.astype("u1"), "plain"),
        ("dot_arrive", arr_q.astype("<u2"), "plain"),
        ("dot_segcnt", D["dot_segcnt"].astype("u1"), "plain"),
        ("dot_home", D["dot_home"].astype("<u2"), "prev"),
        ("dot_flags", flags, "plain"),                         # bits 0-2 rest weekday, bit 3 flies (Hawaii)
        ("seg_day", D["seg_day"].astype("u1"), "plain"),
        ("seg_s", seg_s_q.astype("<u2"), "plain"),
    ]
    parent = np.maximum(par, 0)
    layout, blobs, off = [], [], 0
    for name, arr, enc in arrays:
        bits = arr.dtype.itemsize * 8
        mod = 1 << bits
        if enc == "parent":
            v = arr.astype(np.int64)
            stored = np.where(par >= 0, (v - v[parent]) % mod, v)
        elif enc == "prev":
            v = arr.astype(np.int64)
            stored = np.r_[v[:1], (v[1:] - v[:-1]) % mod]
        else:
            stored = arr
        unsigned = np.dtype(f"<u{arr.dtype.itemsize}") if arr.dtype.itemsize > 1 else np.dtype("u1")
        u = (np.asarray(stored, dtype=np.int64) % mod).astype(unsigned)
        b = u.view("u1").reshape(-1, arr.dtype.itemsize).T.tobytes()  # byte-planar
        pad = (-len(b)) % 4
        layout.append({"name": name, "type": arr.dtype.str.lstrip("<|"), "enc": enc, "offset": off, "count": int(arr.size)})
        blobs.append(b + b"\0" * pad)
        off += len(b) + pad
    raw = b"".join(blobs)
    q = {
        "node_box": node_box, "dot_box": dot_box, "coord_max": COORD_MAX,
        "dist_step_km": DIST_STEP_KM, "conn_step_km": CONN_STEP_KM, "seg_step_km": SEG_STEP_KM,
        "daily_step_km": DAILY_STEP_KM, "daily_min_km": daily_min, "arrive_steps_per_day": ARRIVE_STEPS_PER_DAY,
        "no_county": NO_COUNTY, "width_max": 255, "zone_steps": zone_q,
    }
    return raw, layout, q


def write_images(meta, D):
    """Two small stills: the arc map (no-JS summary) and every walker at home (the verdict page's last frame)."""
    arcs = Image.open(BUILD / "outputs" / "arc_map_state_to_dc.png").convert("RGB")
    arcs = arcs.resize((1400, 900), Image.LANCZOS).quantize(colors=48, method=Image.Quantize.MEDIANCUT)
    arcs.save(PUB / "still-arcs.png", optimize=True)

    # homes: lower-48 view in plain equirectangular-with-cos-latitude, like the map's opening frame
    W, H = 1200, 720
    lon0, lon1, lat0, lat1 = -125.5, -66.0, 23.8, 50.0
    k = np.cos(np.radians(37.5))
    sx = W / ((lon1 - lon0) * k)
    sy = H / (lat1 - lat0)
    s = min(sx, sy)
    ox = (W - (lon1 - lon0) * k * s) / 2
    oy = (H - (lat1 - lat0) * s) / 2
    img = Image.new("RGB", (W, H), (10, 11, 13))
    draw = ImageDraw.Draw(img)
    for f in meta["states_geo"]["features"]:
        g = f["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in polys:
            ring = [(ox + (x - lon0) * k * s, oy + (lat1 - y) * s) for x, y in poly[0]]
            if len(ring) > 2:
                draw.polygon(ring, fill=(20, 23, 28), outline=(43, 48, 56))
    x = ox + (D["dot_lon"] - lon0) * k * s
    y = oy + (lat1 - D["dot_lat"]) * s
    ok = (x >= 0) & (x < W) & (y >= 0) & (y < H)
    for xi, yi in zip(x[ok], y[ok]):
        draw.point((float(xi), float(yi)), fill=(227, 38, 27))
    mall = meta["mall"]
    mx, my = ox + (mall[0] - lon0) * k * s, oy + (lat1 - mall[1]) * s
    draw.ellipse((mx - 7, my - 7, mx + 7, my + 7), outline=(244, 244, 241), width=2)
    img.quantize(colors=16).save(PUB / "homes.png", optimize=True)


def summary(meta):
    report = json.loads((BUILD / "outputs" / "metrics" / "report.json").read_text())
    s3 = json.loads((BUILD / "data" / "processed" / "stage3_meta.json").read_text())
    daily = pd.read_csv(BUILD / "outputs" / "metrics" / "R1_R2_daily.csv")
    total = report["L1_people_gone"]["central"]
    peak = report["P2_daily_needs"]["peak_night_all_counties"]
    key_days = [1, int(peak["day"]), int(report["R1_arrival_curve"]["day_half_arrived"]),
                int(report["R1_arrival_curve"]["day_last_arrival"])]
    rows = []
    for d in key_days:
        r = daily.loc[daily.day == d].iloc[0]
        rows.append({"day": d, "gone": total, "arrived": int(r.arrived_cumulative_people),
                     "on_road": int(total - r.arrived_cumulative_people),
                     "waiting": int(r.dots_waiting_people), "away_tonight": int(r.people_sleeping_away_from_home)})
    jobs = [{"job": r["occupation"], "share": r["share_gone"], "low": r["share_gone_low"], "high": r["share_gone_high"],
             "workers": round(r["workers_gone"] * 1000)} for r in report["L2_jobs_left_undone"]["rows"]]
    return {
        "_note": "Generated by src/viz/finale/prep/prepare_finale_data.py from the migration-map build "
                 "(outputs/metrics/report.json, R1_R2_daily.csv, data/processed/stage3_meta.json). Do not edit by hand.",
        "estimate_note": report["note"],
        "people_per_dot": meta["people_per_dot"],
        "dots": int(round(total / meta["people_per_dot"])),
        "totals": {k: report["L1_people_gone"][k] for k in ["central", "low", "high"]},
        "share_of_adults": report["L1_people_gone"]["share_of_all_census_adults"],
        "if_all_adults": report["L1_people_gone"]["if_cdc_rates_applied_to_all_census_adults"],
        "key_days": rows,
        "half_day": report["R1_arrival_curve"]["day_half_arrived"],
        "last_day": report["R1_arrival_curve"]["day_last_arrival"],
        "milestones": report["R1_arrival_curve"]["milestones_day_by_share_arrived"],
        "jobs": jobs,
        "jobs_method": report["L2_jobs_left_undone"]["method"],
        "peak_night": peak,
        "needs": report["P2_daily_needs"]["per_person_per_night"],
        "counties_outnumbered": report["P1_marchers_per_resident"]["counties_where_marchers_outnumber_residents_on_peak_day"],
        "road": report["P3_road_taken"],
        "queue": report["queueing"],
        "space": report["R2_space_needed"],
        "west_ne_ratio": report["R3_distance_penalty"]["west_to_northeast_ratio"],
        "examples": report["examples"],
        "routing": {k: s3[k] for k in ["network", "dots_walking", "dots_flying_hawaii", "connector_km_median",
                                        "connector_km_p95", "dots_connector_over_50km", "route_ratio_median",
                                        "route_ratio_p10", "route_ratio_p90", "dots_route_ratio_over_1_6", "walk_km_max"]},
        "walk": {"start_hour": meta["walk_start_hour"], "hours": meta["walk_hours"], "arrival_zone_km": meta["arrival_zone_km"]},
        "uncertainty": report["uncertainty"],
        "not_computed": report["L3_daily_output_paused"],
    }


def main():
    PUB.mkdir(parents=True, exist_ok=True)
    meta, D = load_viewer()
    raw, layout, q = pack(meta, D)
    gz = gzip.compress(raw, compresslevel=9, mtime=0)
    (PUB / "march.qbin").write_bytes(gz)
    daily = pd.read_csv(BUILD / "outputs" / "metrics" / "R1_R2_daily.csv")
    report = json.loads((BUILD / "outputs" / "metrics" / "report.json").read_text())
    states_geo = meta["states_geo"]
    run_meta = {
        "format": "finale-march-v1 (gzip; little-endian arrays listed in layout; quantization in q)",
        "bytes": len(raw), "layout": layout, "q": q,
        "people_per_dot": meta["people_per_dot"], "mall": meta["mall"], "iad": meta["iad"],
        "arrival_zone_km": meta["arrival_zone_km"], "walk_start_hour": meta["walk_start_hour"],
        "walk_hours": meta["walk_hours"], "start_date": meta["start_date"],
        "half_day": meta["half_day"], "last_day": meta["last_day"],
        "arrived_cum": meta["arrived_cum"], "away_by_day": meta["away_by_day"],
        "waiting_by_day": [int(x) for x in daily.dots_waiting_people.values],
        "totals": meta["totals"], "jobs": meta["jobs"],
        "jobs_method": report["L2_jobs_left_undone"]["method"],
        "share_of_adults": report["L1_people_gone"]["share_of_all_census_adults"],
        "states": [{"name": s["name"], "abbr": s["abbr"]} for s in meta["states"]],
        "counties": meta["counties"], "needs": meta["needs"], "road": meta["road"], "queue": meta["queue"],
        "states_geo": states_geo,
    }
    (PUB / "meta.json").write_text(json.dumps(run_meta, separators=(",", ":")))
    SUMMARY.write_text(json.dumps(summary(meta), indent=1) + "\n")
    write_images(meta, D)
    for f in sorted(PUB.iterdir()):
        print(f"{f.relative_to(REPO)}: {f.stat().st_size / 1e3:.0f} kB")
    print(f"raw quantized arrays {len(raw) / 1e6:.2f} MB -> gzip {len(gz) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
