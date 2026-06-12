#!/bin/bash

# Target new username
TARGET="Hari-Pi"

# Repositories to transfer (excluding Collab-GDSC which is marked for deletion)
REPOS=(
  "Ransomware-Recovery-Guide"
  "popcorn-desktop"
  "DeathByHopes"
  "M3u8-player"
  "a7y18lte-Resources"
  "kernel_realme_RMX2001"
  "Download-macOS"
  "Lazy_Action-Recoverys-Builder"
  "Action-TWRP-Builder"
  "Patch-Recovery"
  "kernel_samsung_a7y18lte"
  "samsung-fastboot-patcher"
  "GSI"
  "kernel_a52sxq"
  "Pass-Man"
  "lineageos_actions_a7y18lte"
  "ShriGanesha"
  "Eureka-Kernel-Exynos7885-Q-R-S"
  "KernelSU_Action_Buider"
  "android_kernel_samsung_universal7885"
  "TWRP_device_samsung_a7y18lte"
  "Action-OFRP-Builder"
  "apk-builder-action"
  "android_device_samsung_a7y18lte"
  "manifest_pb"
  "umbrel-apps"
)

echo "Starting transfer of DeadPool-4422 repositories to $TARGET..."

for repo in "${REPOS[@]}"; do
  echo "Transferring DeadPool-4422/$repo to $TARGET..."
  
  # Using the native GitHub API endpoint for transferring repositories
  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/DeadPool-4422/$repo/transfer" \
    -f new_owner="$TARGET" --silent
    
  if [ $? -eq 0 ]; then
    echo "✅ Successfully initiated transfer for $repo"
  else
    echo "❌ Failed to transfer $repo"
  fi
  echo "-----------------------------------"
done

echo "All transfer requests have been sent!"
echo "Please check the email associated with $TARGET to accept the transfers."
