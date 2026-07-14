#!/usr/bin/env python3
"""core: align M* YAML ids to Plane hierarchy codes by title; merge · Modules."""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path
from typing import Any

import yaml

sys.path.insert(0, str(Path.home() / ".cursor/skills/platform-doc-plane-sync/scripts"))
from plane_config import resolve_config  # noqa: E402

PREFIX = "marsun-components-core"
HIER_RE = re.compile(r"^(P6\.\d+\.\d+)")
# pm · Module → DT keeper
DUP_TO_KEEPER = {
    "d0ef9ae7-e0e7-4f6c-9c0a-0c0c0c0c0c0c": "",  # filled at runtime
}


class Client:
    def __init__(self, base_url: str, api_key: str, workspace: str, project_id: str, *, write: bool = True):
        self.project_base = f"{base_url.rstrip('/')}/workspaces/{workspace}/projects/{project_id}"
        self.api_key = api_key
        self.write = write

    def request(self, method: str, path: str, *, body: dict | None = None, params: dict | None = None) -> Any:
        if not self.write and method != "GET":
            print(f"DRY  {method} {path}")
            return {}
        url = path if path.startswith("http") else f"{self.project_base}/{path.lstrip('/')}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        headers = {"X-API-Key": self.api_key, "Content-Type": "application/json"}
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        for attempt in range(8):
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    raw = resp.read().decode()
                    if method != "GET":
                        time.sleep(1.05)
                    return json.loads(raw) if raw else {}
            except urllib.error.HTTPError as exc:
                if exc.code == 429 and attempt < 7:
                    time.sleep(max(int(exc.headers.get("Retry-After", "5") or 5), 5))
                    continue
                detail = exc.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"{method} {path} -> {exc.code}: {detail[:400]}") from exc
        return {}

    def paginate(self, path: str) -> list[dict]:
        items, cursor = [], ""
        while True:
            q: dict[str, str] = {"per_page": "100"}
            if cursor:
                q["cursor"] = cursor
            payload = self.request("GET", path, params=q)
            if isinstance(payload, list):
                return payload
            batch = payload.get("results") or []
            items.extend(batch)
            if not payload.get("next_page_results"):
                break
            cursor = payload.get("next_cursor") or ""
        return items

    def module_issue_ids(self, module_id: str) -> list[str]:
        rows = self.paginate(f"modules/{module_id}/module-issues/")
        return [str(r.get("issue") or r.get("id") or "") for r in rows if r.get("issue") or r.get("id")]


def norm_title(s: str) -> str:
    s = re.sub(r"^(?:P6\.\d+\.\d+|M00\d-\d+)\s*[·\-]?\s*", "", s or "")
    s = re.sub(r"^[^·]+·\s*", "", s)
    return re.sub(r"\s+", "", s.lower())


def discover_module_pairs(modules: list[dict]) -> dict[str, str]:
    """hierarchy code → (dup_id, keeper_id)"""
    by_code: dict[str, list[dict]] = defaultdict(list)
    for m in modules:
        name = str(m.get("name") or "")
        code = re.match(r"^(P6\.\d+)", name)
        if not code:
            continue
        by_code[code.group(1)].append(m)
    pairs: dict[str, str] = {}
    for code, mods in by_code.items():
        keeper = next(
            (m for m in mods if str(m.get("external_id") or "").startswith("dev-aanalysis:module:DT-")),
            None,
        )
        dup = next((m for m in mods if "·" in str(m.get("name") or "") and m is not keeper), None)
        if keeper and dup and str(keeper["id"]) != str(dup["id"]):
            pairs[str(dup["id"])] = str(keeper["id"])
            print(f"module pair {code}: dup={dup.get('name')} → keeper={keeper.get('name')}")
    return pairs


def merge_modules(client: Client, pairs: dict[str, str]) -> None:
    for dup_id, keeper_id in pairs.items():
        ids = client.module_issue_ids(dup_id)
        print(f"Merge {dup_id[:8]} → {keeper_id[:8]}: {len(ids)} issues")
        for wi_id in ids:
            if not wi_id:
                continue
            client.request("POST", f"modules/{keeper_id}/module-issues/", body={"issues": [wi_id]})
            try:
                client.request("DELETE", f"modules/{dup_id}/module-issues/{wi_id}/")
            except RuntimeError as exc:
                if "404" not in str(exc):
                    raise
        mods = {str(m["id"]): m for m in client.paginate("modules/")}
        dup = mods.get(dup_id)
        if dup:
            old = str(dup.get("name") or "")
            new = old if old.startswith("(重复·待删)") else f"(重复·待删) {old}"
            client.request("PATCH", f"modules/{dup_id}/", body={"name": new[:255]})
            print(f"  renamed → {new[:50]}")


def build_id_map(repo: Path, snap: dict) -> tuple[dict[str, str], list[dict]]:
    manifest = yaml.safe_load((repo / "plane/sync_manifest.yaml").read_text()) or {}
    wis = snap.get("work_items") or []
    by_ext = {str(w.get("external_id") or ""): w for w in wis}
    by_title: dict[str, list[dict]] = defaultdict(list)
    for w in wis:
        by_title[norm_title(str(w.get("name") or ""))].append(w)

    used_codes: set[str] = set()
    # codes already owned by another sync prefix (shared P6 project) — never steal
    foreign_codes: set[str] = set()
    for w in wis:
        m = HIER_RE.match(str(w.get("name") or "").strip())
        if m:
            used_codes.add(m.group(1))
        ext = str(w.get("external_id") or "")
        m2 = re.search(r"task:(P6\.\d+\.\d+)$", ext)
        if m2:
            code = m2.group(1)
            used_codes.add(code)
            if ext and not ext.startswith(f"{PREFIX}:"):
                foreign_codes.add(code)

    id_map: dict[str, str] = {}
    twins_to_dedupe: list[dict] = []

    # per-milestone free counters for ASSIGN (start above known foreign ranges)
    next_n: dict[str, int] = {"P6.1": 25, "P6.2": 4, "P6.3": 27}
    for ms, start in list(next_n.items()):
        while f"{ms}.{start}" in used_codes:
            start += 1
        next_n[ms] = start

    for task in manifest.get("tasks") or []:
        tid = str(task.get("id") or "")
        name = str(task.get("name") or "")
        ms = str(task.get("milestone") or "")
        if HIER_RE.match(tid):
            id_map[tid] = tid
            continue
        wi = by_ext.get(f"{PREFIX}:task:{tid}")
        if not wi:
            raise SystemExit(f"MISSING WI {tid}")
        # preferred: sibling with hierarchy display + same title
        # skip if code is owned by another prefix (e.g. marsun-arch:task:P6.1.N)
        title = norm_title(name)
        siblings = by_title.get(title, [])
        twin = None
        for s in siblings:
            if s.get("id") == wi.get("id"):
                continue
            m = HIER_RE.match(str(s.get("name") or "").strip())
            if not m:
                continue
            code = m.group(1)
            if code in foreign_codes:
                print(f"SKIP twin {tid}: {code} owned by foreign prefix")
                continue
            twin = (code, s)
            break
        if twin:
            code, tw = twin
            id_map[tid] = code
            used_codes.add(code)
            # twin without our prefix → mark duplicate later
            text = str(tw.get("external_id") or "")
            if not text.startswith(f"{PREFIX}:"):
                twins_to_dedupe.append(tw)
            print(f"MAP {tid} → {code} (name twin)")
            continue
        # assign next free under milestone
        if ms not in next_n:
            raise SystemExit(f"unknown milestone {ms} for {tid}")
        while f"{ms}.{next_n[ms]}" in used_codes:
            next_n[ms] += 1
        code = f"{ms}.{next_n[ms]}"
        next_n[ms] += 1
        used_codes.add(code)
        id_map[tid] = code
        print(f"MAP {tid} → {code} (assign new)")

    from collections import Counter

    dups = [k for k, v in Counter(id_map.values()).items() if v > 1]
    if dups:
        raise SystemExit(f"DUPLICATE targets {dups}")
    return id_map, twins_to_dedupe


def apply_manifest(repo: Path, id_map: dict[str, str]) -> None:
    path = repo / "plane/sync_manifest.yaml"
    data = yaml.safe_load(path.read_text()) or {}
    max_n = 0
    for task in data.get("tasks") or []:
        old = str(task.get("id") or "")
        new = id_map.get(old, old)
        if new != old:
            note = str(task.get("note") or "")
            trace = f"原 id: {old}"
            if trace not in note:
                task["note"] = f"{note}；{trace}" if note else trace
            task["id"] = new
        m = HIER_RE.match(str(task.get("id") or ""))
        if m:
            parts = m.group(1).split(".")
            if parts[0] == "P6" and parts[1] == "3":
                max_n = max(max_n, int(parts[2]))
    data.setdefault("meta", {})["next_task_id"] = f"P6.3.{max_n + 1}"
    path.write_text(yaml.dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False))

    ms_path = repo / "plane/milestones.yaml"
    if ms_path.exists():
        ms = yaml.safe_load(ms_path.read_text()) or {}
        for m in ms.get("milestones") or []:
            tasks = m.get("tasks")
            if isinstance(tasks, str):
                parts = [p.strip() for p in tasks.split(",") if p.strip()]
                m["tasks"] = ",".join(id_map.get(p, p) for p in parts)
        ms_path.write_text(yaml.dump(ms, allow_unicode=True, sort_keys=False, default_flow_style=False))
    print("manifest updated, next", data["meta"]["next_task_id"])


def patch_plane(client: Client, repo: Path, id_map: dict[str, str], twins: list[dict], done_state: str) -> None:
    manifest = yaml.safe_load((repo / "plane/sync_manifest.yaml").read_text()) or {}
    by_new = {str(t["id"]): t for t in (manifest.get("tasks") or [])}
    wis = client.paginate("work-items/")
    by_ext = {str(w.get("external_id") or ""): w for w in wis}
    # also by id
    by_id = {str(w["id"]): w for w in wis}

    for old_id, new_id in id_map.items():
        old_ext = f"{PREFIX}:task:{old_id}"
        new_ext = f"{PREFIX}:task:{new_id}"
        wi = by_ext.get(old_ext) or by_ext.get(new_ext)
        if not wi:
            print(f"SKIP no WI {old_id}")
            continue
        task = by_new.get(new_id, {})
        title = f"{new_id} · {task.get('name', new_id)}"
        body: dict[str, Any] = {}
        if str(wi.get("external_id") or "") != new_ext:
            body["external_id"] = new_ext
        if str(wi.get("name") or "") != title:
            body["name"] = title[:255]
        if body:
            print(f"PATCH {old_id} → {new_id} {list(body)}")
            client.request("PATCH", f"work-items/{wi['id']}/", body=body)
        else:
            print(f"SKIP aligned {new_id}")

    for tw in twins:
        wid = str(tw.get("id") or "")
        if not wid:
            continue
        name = str(tw.get("name") or "")
        new_name = name if name.startswith("(重复·待删)") else f"(重复·待删) {name}"
        body = {"name": new_name[:255]}
        if done_state:
            body["state"] = done_state
        print(f"DEDUPE twin {name[:40]}")
        client.request("PATCH", f"work-items/{wid}/", body=body)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", type=Path, required=True)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    repo = args.repo.resolve()
    cfg = resolve_config(repo)
    client = Client(cfg["base_url"], cfg["api_key"], cfg["workspace"], cfg["project_id"], write=not args.dry_run)

    snap_path = repo / "plane/.cache/plane_snapshot.json"
    snap = json.loads(snap_path.read_text())
    pairs = discover_module_pairs(snap.get("modules") or [])
    if args.all:
        merge_modules(client, pairs)

    id_map, twins = build_id_map(repo, snap)
    (repo / "plane/.cache/core_id_map.json").write_text(json.dumps(id_map, ensure_ascii=False, indent=2))
    print(f"id_map {len(id_map)} twins_to_dedupe {len(twins)}")

    if args.all:
        apply_manifest(repo, id_map)
        # done state
        states = client.paginate("states/")
        done = ""
        for s in states:
            if str(s.get("group") or "") == "completed":
                done = str(s["id"])
                break
        patch_plane(client, repo, id_map, twins, done)
        state_path = repo / "plane/.sync-state.json"
        if state_path.exists():
            st = json.loads(state_path.read_text())
            st["items"] = {}
            state_path.write_text(json.dumps(st, ensure_ascii=False, indent=2))
            print("cleared sync-state")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
