#!/bin/sh
# Fails on any UI string/template/notification lacking en or fr, or any rendered Arabic outside protected text.
set -e
cd "$(dirname "$0")/.."
python3 tools/i18n_merge.py && python3 tools/i18n_pack.py && python3 tools/build_web.py
python3 tools/i18n_audit.py --write
python3 tests/i18n_runtime_e2e.py
