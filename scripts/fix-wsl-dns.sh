#!/usr/bin/env bash
# Restore WSL DNS when systemd-resolved has no upstream servers
# (common with /etc/wsl.conf generateResolvConf = false).
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

WINDOWS_DNS="$(ip route show | awk '/default/ {print $3; exit}')"
if [[ -z "${WINDOWS_DNS}" ]]; then
  echo "Could not detect Windows host DNS gateway." >&2
  exit 1
fi

rm -f /etc/resolv.conf
{
  echo "nameserver ${WINDOWS_DNS}"
  echo "nameserver 8.8.8.8"
  echo "nameserver 1.1.1.1"
} > /etc/resolv.conf
chmod 644 /etc/resolv.conf

echo "Wrote /etc/resolv.conf:"
cat /etc/resolv.conf

if getent hosts github.com >/dev/null 2>&1; then
  echo "DNS OK: github.com resolves."
else
  echo "Warning: github.com still does not resolve." >&2
  exit 1
fi
