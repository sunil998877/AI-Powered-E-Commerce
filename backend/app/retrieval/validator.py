import re
from typing import Tuple

# Blacklisted Cypher keywords for read-only safety
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

# Must contain read/query operations like MATCH or RETURN
REQUIRED_READ_KEYWORDS = [
    re.compile(r"\bMATCH\b", re.IGNORECASE),
    re.compile(r"\bRETURN\b", re.IGNORECASE),
]


class CypherValidationError(Exception):
    pass


def clean_cypher_query(query: str) -> str:
    """Strip markdown code blocks or wrapping quotes if present."""
    q = query.strip()
    # Strip ```cypher or ```
    if q.startswith("```"):
        lines = q.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        q = "\n".join(lines).strip()
    # Strip any enclosing quotes
    if (q.startswith('"') and q.endswith('"')) or (q.startswith("'") and q.endswith("'")):
        q = q[1:-1].strip()
    return q


def validate_cypher(query: str) -> Tuple[bool, str, str]:
    """
    Validates that a Cypher query is read-only and safe to execute.
    Returns: (is_valid: bool, cleaned_query: str, error_message: str)
    """
    if not query or not query.strip():
        return False, "", "Empty query provided."

    cleaned = clean_cypher_query(query)

    # Check for forbidden mutation keywords
    for pattern in COMPILED_FORBIDDEN:
        match = pattern.search(cleaned)
        if match:
            forbidden_word = match.group(0)
            return (
                False,
                cleaned,
                f"Query validation failed: Write or mutation operation '{forbidden_word}' is forbidden in read-only retrieval mode.",
            )

    # Verify query contains RETURN
    if not re.search(r"\bRETURN\b", cleaned, re.IGNORECASE):
        return (
            False,
            cleaned,
            "Query validation failed: Cypher query must contain a RETURN clause to retrieve graph data.",
        )

    # Verify query starts with MATCH or RETURN or WITH
    if not re.match(r"^\s*(MATCH|OPTIONAL\s+MATCH|RETURN|WITH)\b", cleaned, re.IGNORECASE):
        return (
            False,
            cleaned,
            "Query validation failed: Query must begin with a read statement (MATCH, RETURN, or WITH).",
        )

    return True, cleaned, ""
 
 
def validate_cypher_query(query: str) -> Tuple[bool, str]:
    """Compatibility alias returning (is_valid, error_message)."""
    valid, _, err = validate_cypher(query)
    return valid, err
