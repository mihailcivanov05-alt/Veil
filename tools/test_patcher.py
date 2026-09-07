#!/usr/bin/env python3
"""
tools/test_patcher.py - Test Suite for NoReels IPA Patcher & Mach-O Injection
"""

import os
import sys
import shutil
import zipfile
import plistlib
import struct
from pathlib import Path
from patch_ipa import parse_and_inject_macho, patch_ipa, MH_MAGIC_64, LC_LOAD_DYLIB


def create_mock_macho_binary() -> bytearray:
    """Creates a valid minimal Mach-O 64-bit ARM64 binary with padding."""
    endian = "<"
    magic = MH_MAGIC_64
    cputype = 0x0100000C  # CPU_TYPE_ARM64
    cpusubtype = 0x00000000
    filetype = 0x2        # MH_EXECUTE
    ncmds = 1
    sizeofcmds = 72
    flags = 0x00200085
    reserved = 0

    header = struct.pack(
        f"{endian}IIIIIIII",
        magic, cputype, cpusubtype, filetype, ncmds, sizeofcmds, flags, reserved
    )

    # Initial LC_SEGMENT_64 command (__PAGEZERO)
    # struct segment_command_64 { uint32_t cmd; uint32_t cmdsize; char segname[16]; uint64_t vmaddr, vmsize, fileoff, filesize; uint32_t maxprot, initprot, nsects, flags; }
    seg_cmd = struct.pack(
        f"{endian}II16sQQQQIIII",
        0x19, 72, b"__PAGEZERO\x00\x00\x00\x00\x00\x00", 0, 0x100000000, 0, 0, 0, 0, 0, 0
    )

    # 4096 bytes of header padding (standard for iOS binaries)
    padding = b"\x00" * 4024
    code = b"\xC0\x03\x5F\xD6" * 10  # ARM64 'ret' instructions

    return bytearray(header + seg_cmd + padding + code)


def test_macho_injection():
    print("[*] Testing parse_and_inject_macho...")
    raw_binary = create_mock_macho_binary()
    dylib_target = "@rpath/NoReelsIG.dylib"

    patched = parse_and_inject_macho(raw_binary, dylib_target)

    # Inspect patched header
    magic, cputype, cpusubtype, filetype, ncmds, sizeofcmds, flags, reserved = struct.unpack(
        "<IIIIIIII", patched[0:32]
    )

    assert ncmds == 2, f"Expected ncmds == 2, got {ncmds}"
    assert sizeofcmds > 72, f"Expected sizeofcmds > 72, got {sizeofcmds}"

    # Verify LC_LOAD_DYLIB exists
    offset = 32 + 72  # After header and first command
    cmd, cmdsize, name_off = struct.unpack("<III", patched[offset:offset + 12])
    assert cmd == LC_LOAD_DYLIB, f"Expected LC_LOAD_DYLIB (0x0C), got {cmd}"

    name = patched[offset + name_off:offset + cmdsize].split(b"\x00")[0].decode()
    assert name == dylib_target, f"Expected {dylib_target}, got {name}"

    print("✅ Mach-O Injection Test PASSED!")


def test_full_ipa_patching():
    print("[*] Testing full IPA lifecycle patching...")
    test_dir = Path("./.tmp_test_ipa").resolve()
    if test_dir.exists():
        shutil.rmtree(test_dir)
    test_dir.mkdir(parents=True)

    try:
        # Create mock IPA
        mock_app_dir = test_dir / "Payload" / "Instagram.app"
        mock_app_dir.mkdir(parents=True)

        mock_binary_path = mock_app_dir / "Instagram"
        with open(mock_binary_path, "wb") as f:
            f.write(create_mock_macho_binary())

        plist_data = {
            "CFBundleExecutable": "Instagram",
            "CFBundleIdentifier": "com.burbn.instagram",
            "CFBundleName": "Instagram",
            "CFBundleVersion": "345.0.0"
        }
        with open(mock_app_dir / "Info.plist", "wb") as f:
            plistlib.dump(plist_data, f)

        mock_ipa_path = test_dir / "MockInstagram.ipa"
        with zipfile.ZipFile(mock_ipa_path, "w", zipfile.ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(test_dir / "Payload"):
                for file in files:
                    fp = Path(root) / file
                    z.write(fp, Path("Payload") / fp.relative_to(test_dir / "Payload"))

        # Run patch_ipa
        output_ipa = test_dir / "PatchedInstagram.ipa"
        tweak_dylib = Path("tweak/NoReelsIG.dylib").resolve()

        patch_ipa(
            ipa_path=str(mock_ipa_path),
            tweak_dylib_path=str(tweak_dylib),
            output_ipa_path=str(output_ipa),
            custom_bundle_id="com.noreels.instagram",
            app_name="NoReels IG"
        )

        assert output_ipa.is_file(), "Output IPA was not created"

        # Verify output IPA contents
        with zipfile.ZipFile(output_ipa, "r") as z:
            namelist = z.namelist()
            assert any("Frameworks/NoReelsIG.dylib" in name for name in namelist), "Frameworks/NoReelsIG.dylib missing from IPA"
            assert any("Info.plist" in name for name in namelist), "Info.plist missing from IPA"

            # Check Info.plist modified
            plist_bytes = z.read([n for n in namelist if n.endswith("Info.plist")][0])
            out_plist = plistlib.loads(plist_bytes)
            assert out_plist["CFBundleIdentifier"] == "com.noreels.instagram", "Custom Bundle ID not set"
            assert out_plist["CFBundleDisplayName"] == "NoReels IG", "Custom App Name not set"

        print("✅ Full IPA Lifecycle Test PASSED!")

    finally:
        if test_dir.exists():
            shutil.rmtree(test_dir)


if __name__ == "__main__":
    test_macho_injection()
    test_full_ipa_patching()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
