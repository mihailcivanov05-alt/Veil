#!/usr/bin/env python3
"""
tools/generate_mobileconfig.py - Generates iOS WebClip configuration profiles for NoReels
Allows 1-tap installation of distraction-free standalone web containers onto iPhone.
"""

import plistlib
import uuid
import argparse
from pathlib import Path


def generate_noreels_profile(output_path: str = "NoReels_DistractionFree.mobileconfig"):
    profile_uuid = str(uuid.uuid4()).upper()
    ig_clip_uuid = str(uuid.uuid4()).upper()
    yt_clip_uuid = str(uuid.uuid4()).upper()

    profile_dict = {
        "PayloadDisplayName": "NoReels Distraction-Free Apps",
        "PayloadDescription": "Installs distraction-free Instagram and YouTube clients on your iPhone.",
        "PayloadIdentifier": "com.noreels.profile",
        "PayloadOrganization": "NoReels Private",
        "PayloadRemovalDisallowed": False,
        "PayloadType": "Configuration",
        "PayloadUUID": profile_uuid,
        "PayloadVersion": 1,
        "PayloadContent": [
            {
                "PayloadType": "com.apple.webClip.managed",
                "PayloadVersion": 1,
                "PayloadIdentifier": "com.noreels.webclip.instagram",
                "PayloadUUID": ig_clip_uuid,
                "PayloadDisplayName": "Instagram (No Reels)",
                "URL": "https://www.instagram.com/direct/inbox/",
                "FullScreen": False,
                "IsRemovable": True,
                "Precomposed": True
            },
            {
                "PayloadType": "com.apple.webClip.managed",
                "PayloadVersion": 1,
                "PayloadIdentifier": "com.noreels.webclip.youtube",
                "PayloadUUID": yt_clip_uuid,
                "PayloadDisplayName": "YouTube (No Shorts)",
                "URL": "https://m.youtube.com/feed/subscriptions",
                "FullScreen": False,
                "IsRemovable": True,
                "Precomposed": True
            }
        ]
    }

    out_file = Path(output_path).resolve()
    with open(out_file, "wb") as f:
        plistlib.dump(profile_dict, f)

    print(f"✅ Generated Apple Configuration Profile: {out_file.name}")
    print(f"📲 AirDrop or email this file to your iPhone to install with 1 tap in Settings.")


if __name__ == "__main__":
    generate_noreels_profile()
