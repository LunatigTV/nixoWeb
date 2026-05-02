from datetime import datetime
from pathlib import Path
import json
import re


def latest_timestamp(values):
    latest_dt, latest_raw = None, None
    for val in values:
        if not isinstance(val, str): continue
        try:
            parsed = datetime.strptime(val, "%Y-%m-%d %H:%M:%S %z")
            if latest_dt is None or parsed > latest_dt:
                latest_dt, latest_raw = parsed, val
        except ValueError:
            continue
    return latest_raw


def clean_node(data):
    if isinstance(data, list):
        return [clean_node(i) for i in data]
    if not isinstance(data, dict):
        return data

    cleaned = {
        str(k): clean_node(v) for k, v in data.items()
        if k != "unlocked_recipes" and not str(k).startswith("minecraft:recipes")
    }

    criteria = cleaned.get("criteria")
    done = cleaned.get("done")

    if isinstance(criteria, dict) and "done" in cleaned:
        is_completed_flag = (done is True) or (isinstance(done, dict) and not done)
        latest_ts = latest_timestamp(criteria.values())

        if len(criteria) == 1:
            val = latest_ts or (done if isinstance(done, str) else {})
            return {"done": val}

        res = dict(cleaned)
        res["criteria"] = len(criteria)

        if isinstance(done, str):
            res["done"] = done
        elif is_completed_flag and latest_ts:
            res["done"] = latest_ts
        else:
            res.pop("done", None)

        return res

    return cleaned


def compress_advancement(data):
    if not isinstance(data, dict): return {}
    disp = data.get("display", {})
    crit = data.get("criteria", {})

    def get_val(obj, keys):
        if not isinstance(obj, dict): return str(obj or "")
        for k in keys:
            if v := obj.get(k): return str(v)
        return ""

    return {
        "icon": get_val(disp.get("icon"), ["id", "item"]),
        "title": get_val(disp.get("title"), ["translate", "text", "id"]),
        "description": get_val(disp.get("description"), ["translate", "text", "id"]),
        "frame": get_val(disp.get("frame"), ["translate", "text", "id"]),
        "criteria": len(crit) if isinstance(crit, dict) else 0,
    }


def process_advancements():
    base = Path(__file__).resolve().parent.parent
    src, out = base / "uncompressed" / "advancements", base
    if not src.exists(): return print(f"Missing: {src}")

    print(f"Compressing advancements...")
    for v_dir in sorted(p for p in src.iterdir() if p.is_dir()):
        v_data = {}
        for c_dir in sorted(p for p in v_dir.iterdir() if p.is_dir()):
            cat_data = {}
            for f in sorted(c_dir.rglob("*.json")):
                try:
                    with open(f, "r", encoding="utf-8") as file:
                        cat_data[f.stem] = compress_advancement(json.load(file))
                except Exception as e:
                    print(f"Error {f.name}: {e}")
            if cat_data: v_data[c_dir.name] = cat_data

        if v_data:
            with open(out / f"{v_dir.name}.json", "w", encoding="utf-8") as f:
                json.dump(v_data, f, separators=(",", ":"))
    return None


def process_files():
    base = Path(__file__).resolve().parent.parent
    src, out = base / "uncompressed", base
    pattern = re.compile(r"^nixocraft_\d+$", re.I)
    if not src.exists(): return

    for m_dir in sorted(p for p in src.iterdir() if p.is_dir() and pattern.match(p.name)):
        for f in m_dir.rglob("*.json"):
            if f.name.startswith("compressed_"): continue
            try:
                dest = out / f.relative_to(src)
                dest.parent.mkdir(parents=True, exist_ok=True)
                with open(f, "r", encoding="utf-8") as r, open(dest, "w", encoding="utf-8") as w:
                    json.dump(clean_node(json.load(r)), w, separators=(",", ":"))
                print(f"Compressed {f.name}")
            except Exception as e:
                print(f"Error {f.name}: {e}")


if __name__ == "__main__":
    process_files()
    process_advancements()
