#!/usr/bin/env bash
set -euo pipefail

require_command() {
  local command_name="$1"
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "[gitlab][error] missing required command: ${command_name}" >&2
    exit 1
  }
}

gitlab_token() {
  if [[ -n "${GITLAB_API_TOKEN:-}" ]]; then
    printf '%s' "${GITLAB_API_TOKEN}"
    return
  fi
  if [[ -n "${OPENHANDS_GITLAB_TOKEN:-}" ]]; then
    printf '%s' "${OPENHANDS_GITLAB_TOKEN}"
    return
  fi
  echo "[gitlab][error] missing token: set GITLAB_API_TOKEN or OPENHANDS_GITLAB_TOKEN" >&2
  exit 1
}

git_origin_url() {
  local origin_url
  origin_url="$(git config --get remote.origin.url || true)"
  if [[ -z "${origin_url}" ]]; then
    echo "[gitlab][error] could not resolve git remote origin URL" >&2
    exit 1
  fi
  printf '%s' "${origin_url}"
}

gitlab_host_from_origin() {
  local origin_url="$1"
  if [[ "${origin_url}" =~ ^ssh://([^@/]+@)?([^/:]+)(:[0-9]+)?/(.+)$ ]]; then
    printf '%s' "${BASH_REMATCH[2]}"
    return
  fi
  if [[ "${origin_url}" =~ ^git@([^:]+):(.+)$ ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
    return
  fi
  if [[ "${origin_url}" =~ ^https?://([^@/]+@)?([^/]+)/(.+)$ ]]; then
    printf '%s' "${BASH_REMATCH[2]}"
    return
  fi
  echo "[gitlab][error] unsupported remote origin URL format: ${origin_url}" >&2
  exit 1
}

gitlab_project_path_from_origin() {
  local origin_url="$1"
  local project_path
  if [[ "${origin_url}" =~ ^ssh://([^@/]+@)?([^/:]+)(:[0-9]+)?/(.+)$ ]]; then
    project_path="${BASH_REMATCH[4]}"
  elif [[ "${origin_url}" =~ ^git@([^:]+):(.+)$ ]]; then
    project_path="${BASH_REMATCH[2]}"
  elif [[ "${origin_url}" =~ ^https?://([^@/]+@)?([^/]+)/(.+)$ ]]; then
    project_path="${BASH_REMATCH[3]}"
  else
    echo "[gitlab][error] unsupported remote origin URL format: ${origin_url}" >&2
    exit 1
  fi
  project_path="${project_path%.git}"
  printf '%s' "${project_path}"
}

gitlab_api_base() {
  if [[ -n "${GITLAB_API_BASE_URL:-}" ]]; then
    printf '%s' "${GITLAB_API_BASE_URL}"
    return
  fi
  local origin_url host
  origin_url="$(git_origin_url)"
  host="$(gitlab_host_from_origin "${origin_url}")"
  printf 'https://%s/api/v4' "${host}"
}

urlencode() {
  local raw_value="$1"
  printf '%s' "${raw_value}" | jq -sRr @uri
}

gitlab_api_request_status() {
  local method="$1"
  local path="$2"
  local output_file="$3"
  shift 3

  local token api_base url
  token="$(gitlab_token)"
  api_base="$(gitlab_api_base)"
  url="${api_base}${path}"

  python3 - "$method" "$url" "$output_file" "$token" "$@" <<'PY'
from __future__ import annotations

import sys
from urllib import error, parse, request


def parse_args(raw_args: list[str]) -> tuple[dict[str, str], list[tuple[str, str]]]:
    headers: dict[str, str] = {}
    form_pairs: list[tuple[str, str]] = []
    index = 0

    while index < len(raw_args):
        current = raw_args[index]
        if current == "--header":
            name, value = raw_args[index + 1].split(":", 1)
            headers[name.strip()] = value.strip()
            index += 2
            continue
        if current == "--data-urlencode":
            key, value = raw_args[index + 1].split("=", 1)
            form_pairs.append((key, value))
            index += 2
            continue
        raise SystemExit(f"[gitlab][error] unsupported request argument: {current}")

    return headers, form_pairs


def main() -> int:
    method, url, output_path, token, *raw_args = sys.argv[1:]
    extra_headers, form_pairs = parse_args(raw_args)

    headers = {"PRIVATE-TOKEN": token, **extra_headers}
    payload = None

    if form_pairs:
        encoded_form = parse.urlencode(form_pairs)
        if method.upper() in {"GET", "DELETE"}:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{encoded_form}"
        else:
            payload = encoded_form.encode("utf-8")
            headers.setdefault("Content-Type", "application/x-www-form-urlencoded")

    request_obj = request.Request(url, data=payload, method=method.upper(), headers=headers)
    status_code = 0
    body = b""

    try:
        with request.urlopen(request_obj) as response:
            status_code = response.getcode()
            body = response.read()
    except error.HTTPError as exc:
        status_code = exc.code
        body = exc.read()
    except Exception as exc:  # pragma: no cover - shell integration path
        sys.stderr.write(f"[gitlab][error] request failed: {exc}\n")
        return 1

    with open(output_path, "wb") as handle:
        handle.write(body)

    sys.stdout.write(str(status_code))
    return 0


raise SystemExit(main())
PY
}

gitlab_api_request() {
  local method="$1"
  local path="$2"
  shift 2

  local token api_base tmp_file http_code
  token="$(gitlab_token)"
  api_base="$(gitlab_api_base)"
  tmp_file="$(mktemp)"

  http_code="$(gitlab_api_request_status "${method}" "${path}" "${tmp_file}" "$@")"

  if [[ "${http_code}" -lt 200 || "${http_code}" -ge 300 ]]; then
    echo "[gitlab][error] ${method} ${path} -> HTTP ${http_code}" >&2
    cat "${tmp_file}" >&2
    rm -f "${tmp_file}"
    exit 1
  fi

  cat "${tmp_file}"
  rm -f "${tmp_file}"
}

gitlab_api_download() {
  local path="$1"
  local output_file="$2"
  shift 2

  local http_code
  http_code="$(gitlab_api_request_status GET "${path}" "${output_file}" "$@")"

  if [[ "${http_code}" -lt 200 || "${http_code}" -ge 300 ]]; then
    echo "[gitlab][error] GET ${path} -> HTTP ${http_code}" >&2
    cat "${output_file}" >&2 || true
    rm -f "${output_file}"
    exit 1
  fi
}

gitlab_project_id() {
  if [[ -n "${GITLAB_PROJECT_ID:-}" ]]; then
    printf '%s' "${GITLAB_PROJECT_ID}"
    return
  fi

  local origin_url project_path encoded_path
  origin_url="$(git_origin_url)"
  project_path="$(gitlab_project_path_from_origin "${origin_url}")"
  encoded_path="$(urlencode "${project_path}")"

  gitlab_api_request GET "/projects/${encoded_path}" | jq -r '.id'
}

gitlab_project() {
  local project_id="$1"
  gitlab_api_request GET "/projects/${project_id}"
}

gitlab_project_update() {
  local project_id="$1"
  shift
  gitlab_api_request PUT "/projects/${project_id}" "$@"
}

gitlab_protected_branches() {
  local project_id="$1"
  gitlab_api_request GET "/projects/${project_id}/protected_branches"
}

git_current_branch() {
  git rev-parse --abbrev-ref HEAD
}

git_default_target_branch() {
  printf '%s' "${GITLAB_TARGET_BRANCH:-main}"
}

gitlab_open_merge_request_by_branch() {
  local project_id="$1"
  local source_branch="$2"
  local target_branch="$3"
  local encoded_source encoded_target
  encoded_source="$(urlencode "${source_branch}")"
  encoded_target="$(urlencode "${target_branch}")"
  gitlab_api_request GET "/projects/${project_id}/merge_requests?state=opened&source_branch=${encoded_source}&target_branch=${encoded_target}"
}

gitlab_merge_request() {
  local project_id="$1"
  local mr_iid="$2"
  gitlab_api_request GET "/projects/${project_id}/merge_requests/${mr_iid}"
}

gitlab_merge_request_merge_status() {
  local project_id="$1"
  local mr_iid="$2"
  local output_file="$3"
  shift 3
  gitlab_api_request_status PUT "/projects/${project_id}/merge_requests/${mr_iid}/merge" "${output_file}" "$@"
}

gitlab_merge_request_pipeline_id() {
  local project_id="$1"
  local mr_iid="$2"
  gitlab_merge_request "${project_id}" "${mr_iid}" | jq -r '.head_pipeline.id // empty'
}

gitlab_resolve_mr_iid_by_branch() {
  local project_id="$1"
  local source_branch="$2"
  local target_branch="$3"
  gitlab_open_merge_request_by_branch "${project_id}" "${source_branch}" "${target_branch}" \
    | jq -r 'if length > 0 then .[0].iid else empty end'
}

gitlab_pipeline() {
  local project_id="$1"
  local pipeline_id="$2"
  gitlab_api_request GET "/projects/${project_id}/pipelines/${pipeline_id}"
}

gitlab_pipeline_retry() {
  local project_id="$1"
  local pipeline_id="$2"
  gitlab_api_request POST "/projects/${project_id}/pipelines/${pipeline_id}/retry"
}

gitlab_pipeline_jobs() {
  local project_id="$1"
  local pipeline_id="$2"
  gitlab_api_request GET "/projects/${project_id}/pipelines/${pipeline_id}/jobs?per_page=100"
}

gitlab_failed_pipeline_jobs() {
  local project_id="$1"
  local pipeline_id="$2"
  gitlab_pipeline_jobs "${project_id}" "${pipeline_id}" \
    | jq '[.[] | select(.status == "failed" or .status == "canceled" or .status == "canceling")]'
}

gitlab_effective_pipeline_status() {
  local project_id="$1"
  local pipeline_id="$2"
  local pipeline_status="$3"

  case "${pipeline_status}" in
    canceled|canceling)
      if gitlab_pipeline_jobs "${project_id}" "${pipeline_id}" \
        | jq -e 'any(.[]; .status == "failed")' >/dev/null; then
        printf 'failed\n'
        return
      fi
      ;;
  esac

  printf '%s\n' "${pipeline_status}"
}

gitlab_job_trace() {
  local project_id="$1"
  local job_id="$2"
  gitlab_api_request GET "/projects/${project_id}/jobs/${job_id}/trace"
}

gitlab_job() {
  local project_id="$1"
  local job_id="$2"
  gitlab_api_request GET "/projects/${project_id}/jobs/${job_id}"
}

gitlab_job_artifacts_download() {
  local project_id="$1"
  local job_id="$2"
  local output_path="$3"
  local artifact_rel_path="${4:-}"
  local request_path

  if [[ -n "${artifact_rel_path}" ]]; then
    request_path="/projects/${project_id}/jobs/${job_id}/artifacts/$(urlencode "${artifact_rel_path}")"
  else
    request_path="/projects/${project_id}/jobs/${job_id}/artifacts"
  fi

  gitlab_api_download "${request_path}" "${output_path}"
}

gitlab_pipelines_by_ref() {
  local project_id="$1"
  local ref="$2"
  local per_page="${3:-20}"
  local encoded_ref
  encoded_ref="$(urlencode "${ref}")"
  gitlab_api_request GET "/projects/${project_id}/pipelines?ref=${encoded_ref}&per_page=${per_page}"
}

gitlab_latest_pipeline_id_by_ref() {
  local project_id="$1"
  local ref="$2"
  gitlab_pipelines_by_ref "${project_id}" "${ref}" 1 | jq -r 'if length > 0 then .[0].id else empty end'
}

gitlab_pipeline_id_by_ref_sha() {
  local project_id="$1"
  local ref="$2"
  local sha="$3"
  local encoded_ref encoded_sha
  encoded_ref="$(urlencode "${ref}")"
  encoded_sha="$(urlencode "${sha}")"
  gitlab_api_request GET "/projects/${project_id}/pipelines?ref=${encoded_ref}&sha=${encoded_sha}&per_page=1" \
    | jq -r 'if length > 0 then .[0].id else empty end'
}
