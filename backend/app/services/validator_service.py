import re
from typing import Tuple

FORBIDDEN_KEYWORDS = [
    r"\bCREATE\b",
    r"\bDELETE\b",
    r"\bDETACH\b",
    r"\bSET\b",
    r"\bREMOVE\b",
    r"\bMERGE\b",
    r"\bDROP\b",
    r"\bALTER\b",
    r"\bCALL\b",
    r"\bLOAD\s+CSV\b",
    r"\bFOREACH\b",
]

COMPILED_FORBIDDEN = [re.compile(kw, re.IGNORECASE) for kw in FORBIDDEN_KEYWORDS]


class CypherValidationError(Exception):
    pass


def clean_cypher_query(query: str) -> str:
    q = query.strip()
    if q.startswith("```"):
        lines = q.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        q = "\n".join(lines).strip()
    if (q.startswith('"') and q.endswith('"')) or (q.startswith("'") and q.endswith("'")):
        q = q[1:-1].strip()
    return q


def validate_cypher(query: str) -> Tuple[bool, str, str]:
    if not query or not query.strip():
        return False, "", "Empty query provided."

    cleaned = clean_cypher_query(query)

    for pattern in COMPILED_FORBIDDEN:
        match = pattern.search(cleaned)
        if match:
            forbidden_word = match.group(0)
            return (
                False,
                cleaned,
                f"Query validation failed: Write or mutation operation '{forbidden_word}' is forbidden in read-only retrieval mode.",
            )

    if not re.search(r"\bRETURN\b", cleaned, re.IGNORECASE):
        return (
            False,
            cleaned,
            "Query validation failed: Cypher query must contain a RETURN clause to retrieve graph data.",
        )

    if not re.match(r"^\s*(MATCH|OPTIONAL\s+MATCH|RETURN|WITH)\b", cleaned, re.IGNORECASE):
        return (
            False,
            cleaned,
            "Query validation failed: Query must begin with a read statement (MATCH, RETURN, or WITH).",
        )

    return True, cleaned, ""
