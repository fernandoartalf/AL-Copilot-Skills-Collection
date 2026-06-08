"""Smoke tests for the section-key binding contract.

Covers the three cases enumerated in
``docs/plans/PLAN-documentation-bc-section-key-fix.md`` §5 Phase 4:

1. Spanish markdown WITH ``<!-- section-key: ... -->`` anchors → canonical
   English PascalCase keys (primary path).
2. Spanish markdown WITHOUT anchors → schema-driven fallback recovers
   canonical English PascalCase keys (Phase-2 safety net).
3. English markdown WITHOUT anchors → legacy ``heading_to_key`` path
   continues to produce identical English PascalCase keys (backward compat).

Run with::

    pytest .github/skills/documentation-bc-md-to-docx-converter/tests -q
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

# Make the converter script importable as a module.
SCRIPT_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import convert_md_to_docx as conv  # noqa: E402


def _load_spec_schema() -> dict:
    schema_path = (
        Path(__file__).resolve().parents[2]
        / "documentation-bc-technical-spec-generator"
        / "references"
        / "spec-fields.json"
    )
    with schema_path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


@pytest.fixture(scope="module")
def schema() -> dict:
    return _load_spec_schema()


MD_ES_WITH_ANCHORS = """\
# SPEC-001 — Demo

## 1. Referencia a la historia de usuario
<!-- section-key: UserStoryReference -->

Cuerpo ES.

## 2. Diseño técnico
<!-- section-key: TechnicalDesignOverview -->

Otro cuerpo.
"""

MD_ES_WITHOUT_ANCHORS = """\
# SPEC-001 — Demo

## 1. Referencia a la historia de usuario

Cuerpo ES.

## 2. Visión técnica del diseño

Otro cuerpo.
"""

MD_EN_WITHOUT_ANCHORS = """\
# SPEC-001 — Demo

## 1. User Story Reference

Body EN.

## 2. Technical Design Overview

More body.
"""


def _parse(content: str, schema: dict | None) -> dict:
    sections: dict[str, str] = {}
    return conv._parse_h2_sections(content, sections, md_path=None, schema=schema)


def test_es_with_anchors_yields_canonical_keys(schema: dict) -> None:
    result = _parse(MD_ES_WITH_ANCHORS, schema)
    assert "UserStoryReference" in result
    assert "TechnicalDesignOverview" in result
    # No translated derivatives.
    assert not any(k.startswith("Referencia") for k in result)


def test_es_without_anchors_falls_back_to_schema(schema: dict) -> None:
    result = _parse(MD_ES_WITHOUT_ANCHORS, schema)
    # Both Spanish display headings declared in spec-fields.json should resolve.
    assert "UserStoryReference" in result, (
        "Schema fallback failed to map Spanish heading to canonical key. "
        f"Keys produced: {sorted(result)}"
    )
    assert "TechnicalDesignOverview" in result, (
        f"Keys produced: {sorted(result)}"
    )


def test_en_without_anchors_uses_legacy_heading_to_key(schema: dict) -> None:
    result = _parse(MD_EN_WITHOUT_ANCHORS, schema)
    # Either schema path or legacy heading_to_key must reach the same key.
    assert "UserStoryReference" in result
    assert "TechnicalDesignOverview" in result


def test_schema_declares_section_anchor_template(schema: dict) -> None:
    assert schema.get("sectionAnchorTemplate") == "<!-- section-key: {{key}} -->"
