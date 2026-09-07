#!/usr/bin/env python3
"""
tools/patch_ipa.py - NoReels IPA Dynamic Library Injector
Injects NoReelsIG.dylib or NoReelsYT.dylib into decrypted iOS IPA packages.
"""

import sys
import os
import shutil
import zipfile
import struct
import plistlib
import argparse
from pathlib import Path

# Mach-O Constants
MH_MAGIC_64 = 0xFEEDFACF
MH_CIGAM_64 = 0xCFFAEDFE
FAT_MAGIC = 0xCAFEBABE
FAT_CIGAM = 0xBEBAFECA

LC_LOAD_DYLIB = 0x0C
LC_LOAD_WEAK_DYLIB = 0x18 | 0x80000000
LC_RPATH = 0x1C | 0x80000000


def align_to(val, alignment=8):
    """Align value to the nearest multiple of alignment."""
    return (val + (alignment - 1)) & ~(alignment - 1)


def parse_and_inject_macho(binary_bytes: bytearray, dylib_path: str) -> bytearray:
    """
    Injects LC_LOAD_DYLIB load command into Mach-O 64-bit binary.
    """
    if len(binary_bytes) < 32:
        raise ValueError("Binary too small to be a valid Mach-O")

    magic = struct.unpack("<I", binary_bytes[0:4])[0]

    # Handle FAT / Universal Binaries
    if magic in (FAT_MAGIC, FAT_CIGAM):
        is_big = (magic == FAT_MAGIC)
        endian = ">" if is_big else "<"
        nfat_arch = struct.unpack(f"{endian}I", binary_bytes[4:8])[0]
        print(f"[*] Detected FAT Universal binary with {nfat_arch} architectures")

        modified_bytes = bytearray(binary_bytes)
        for i in range(nfat_arch):
            offset_idx = 8 + i * 20
            cputype, cpusubtype, offset, size, align = struct.unpack(f"{endian}IIIII", binary_bytes[offset_idx:offset_idx + 20])
            print(f"[*] Processing architecture index {i} (offset: {offset}, size: {size})...")
            arch_slice = bytearray(binary_bytes[offset:offset + size])
            patched_slice = inject_macho_slice(arch_slice, dylib_path)
            # If size didn't expand beyond slice, write back
            if len(patched_slice) == len(arch_slice):
                modified_bytes[offset:offset + size] = patched_slice
            else:
                print(f"[!] Warning: Slice expanded, writing modified slice.")
                modified_bytes[offset:offset + len(patched_slice)] = patched_slice
        return modified_bytes

    elif magic in (MH_MAGIC_64, MH_CIGAM_64):
        return inject_macho_slice(binary_bytes, dylib_path)
    else:
        raise ValueError(f"Unsupported Mach-O magic: 0x{magic:08X}")


def inject_macho_slice(binary_bytes: bytearray, dylib_path: str) -> bytearray:
    """
    Injects LC_LOAD_DYLIB into a single 64-bit Mach-O architecture.
    """
    endian = "<"  # ARM64 is Little Endian
    magic, cputype, cpusubtype, filetype, ncmds, sizeofcmds, flags, reserved = struct.unpack(
        f"{endian}IIIIIIII", binary_bytes[0:32]
    )

    header_size = 32
    load_cmds_offset = header_size
    load_cmds_end = load_cmds_offset + sizeofcmds

    # Check if dylib is already injected
    offset = load_cmds_offset
    for _ in range(ncmds):
        cmd, cmdsize = struct.unpack(f"{endian}II", binary_bytes[offset:offset + 8])
        if cmd in (LC_LOAD_DYLIB, LC_LOAD_WEAK_DYLIB):
            name_offset = struct.unpack(f"{endian}I", binary_bytes[offset + 8:offset + 12])[0]
            name_bytes = binary_bytes[offset + name_offset:offset + cmdsize]
            name = name_bytes.split(b"\x00")[0].decode("utf-8", errors="ignore")
            if dylib_path in name:
                print(f"[*] Dylib '{dylib_path}' is already present in Mach-O header. Skipping injection.")
                return binary_bytes
        offset += cmdsize

    # Prepare LC_LOAD_DYLIB load command payload
    # struct dylib_command { uint32_t cmd; uint32_t cmdsize; struct dylib { union lc_str name; uint32_t timestamp; uint32_t current_version; uint32_t compatibility_version; } dylib; }
    dylib_path_bytes = dylib_path.encode("utf-8") + b"\x00"
    cmd_name_offset = 24  # Size of dylib_command struct header
    raw_cmd_size = cmd_name_offset + len(dylib_path_bytes)
    aligned_cmd_size = align_to(raw_cmd_size, 8)
    padding_len = aligned_cmd_size - raw_cmd_size

    cmd_payload = struct.pack(
        f"{endian}IIIIII",
        LC_LOAD_DYLIB,
        aligned_cmd_size,
        cmd_name_offset,
        0,       # timestamp
        0x00010000,  # current_version 1.0.0
        0x00010000   # compatibility_version 1.0.0
    ) + dylib_path_bytes + (b"\x00" * padding_len)

    # Check available padding space before first section (__TEXT)
    padding_available = binary_bytes[load_cmds_end:load_cmds_end + aligned_cmd_size]
    is_all_zero = all(b == 0 for b in padding_available)

    if not is_all_zero:
        print("[!] Note: Overwriting existing header space or expanding commands.")

    # Insert new load command at load_cmds_end
    binary_bytes[load_cmds_end:load_cmds_end + aligned_cmd_size] = cmd_payload

    # Update Mach-O header: increment ncmds and sizeofcmds
    new_ncmds = ncmds + 1
    new_sizeofcmds = sizeofcmds + aligned_cmd_size

    new_header = struct.pack(
        f"{endian}IIIIIIII",
        magic, cputype, cpusubtype, filetype, new_ncmds, new_sizeofcmds, flags, reserved
    )
    binary_bytes[0:32] = new_header

    print(f"[+] Successfully injected LC_LOAD_DYLIB ('{dylib_path}')! Total commands: {new_ncmds}")
    return binary_bytes


def patch_ipa(ipa_path: str, tweak_dylib_path: str, output_ipa_path: str, custom_bundle_id: str = None, app_name: str = None):
    """
    Extracts IPA, injects tweak dylib, updates Info.plist, and rebuilds IPA.
    """
    ipa_path = Path(ipa_path).resolve()
    tweak_dylib_path = Path(tweak_dylib_path).resolve()
    output_ipa_path = Path(output_ipa_path).resolve()

    if not ipa_path.is_file():
        raise FileNotFoundError(f"Input IPA not found: {ipa_path}")
    if not tweak_dylib_path.is_file():
        raise FileNotFoundError(f"Tweak dylib not found: {tweak_dylib_path}")

    work_dir = Path("./.tmp_patch_work").resolve()
    if work_dir.exists():
        shutil.rmtree(work_dir)
    work_dir.mkdir(parents=True)

    try:
        print(f"[*] Extracting {ipa_path.name}...")
        with zipfile.ZipFile(ipa_path, "r") as z:
            z.extractall(work_dir)

        payload_dir = work_dir / "Payload"
        if not payload_dir.is_dir():
            raise ValueError("Invalid IPA: 'Payload' directory not found.")

        app_dirs = [d for d in payload_dir.iterdir() if d.is_dir() and d.name.endswith(".app")]
        if not app_dirs:
            raise ValueError("No .app directory found inside Payload.")
        
        app_dir = app_dirs[0]
        print(f"[*] Found target app: {app_dir.name}")

        info_plist_path = app_dir / "Info.plist"
        with open(info_plist_path, "rb") as f:
            plist_data = plistlib.load(f)

        executable_name = plist_data.get("CFBundleExecutable")
        if not executable_name:
            raise ValueError("CFBundleExecutable not found in Info.plist")

        exec_path = app_dir / executable_name
        print(f"[*] Target executable binary: {exec_path.name}")

        # Ensure Frameworks directory exists inside app
        frameworks_dir = app_dir / "Frameworks"
        frameworks_dir.mkdir(exist_ok=True)

        dest_dylib_path = frameworks_dir / tweak_dylib_path.name
        shutil.copy2(tweak_dylib_path, dest_dylib_path)
        print(f"[+] Copied {tweak_dylib_path.name} to Frameworks/")

        # Patch the Mach-O binary
        with open(exec_path, "rb") as f:
            binary_bytes = bytearray(f.read())

        injected_rpath = f"@rpath/{tweak_dylib_path.name}"
        patched_binary = parse_and_inject_macho(binary_bytes, injected_rpath)

        with open(exec_path, "wb") as f:
            f.write(patched_binary)
        print(f"[+] Saved patched executable {exec_path.name}")

        # Optional: Customize Bundle Identifier and Display Name
        if custom_bundle_id:
            plist_data["CFBundleIdentifier"] = custom_bundle_id
            print(f"[+] Set CFBundleIdentifier to: {custom_bundle_id}")

        if app_name:
            plist_data["CFBundleDisplayName"] = app_name
            plist_data["CFBundleName"] = app_name
            print(f"[+] Set CFBundleDisplayName to: {app_name}")

        with open(info_plist_path, "wb") as f:
            plistlib.dump(plist_data, f)

        # Repackage to output IPA
        print(f"[*] Packaging patched IPA: {output_ipa_path.name}...")
        output_ipa_path.parent.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(output_ipa_path, "w", zipfile.ZIP_DEFLATED) as z_out:
            for root, dirs, files in os.walk(work_dir):
                for file in files:
                    full_path = Path(root) / file
                    rel_path = full_path.relative_to(work_dir)
                    z_out.write(full_path, rel_path)

        print(f"🎉 Success! Patched IPA created at: {output_ipa_path}")
        print(f"📦 Ready to sideload via Sideloadly, AltStore, SideStore, or TrollStore.")

    finally:
        if work_dir.exists():
            shutil.rmtree(work_dir)


def main():
    parser = argparse.ArgumentParser(description="NoReels iOS IPA Patcher Tool")
    parser.add_argument("--ipa", required=True, help="Path to input decrypted .ipa file")
    parser.add_argument("--tweak", required=True, help="Path to tweak .dylib (e.g. tweak/NoReelsIG.dylib)")
    parser.add_argument("--output", required=True, help="Path to output patched .ipa file")
    parser.add_argument("--bundle-id", help="Optional custom Bundle ID (e.g. com.noreels.instagram)")
    parser.add_argument("--name", help="Optional custom Display Name (e.g. 'NoReels IG')")

    args = parser.parse_args()
    patch_ipa(
        ipa_path=args.ipa,
        tweak_dylib_path=args.tweak,
        output_ipa_path=args.output,
        custom_bundle_id=args.bundle_id,
        app_name=args.name
    )


if __name__ == "__main__":
    main()
