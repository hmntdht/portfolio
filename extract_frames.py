#!/usr/bin/env python3
"""
Frame Extraction Script for Portfolio Character Animation
=========================================================

This script:
1. Inspects the character.mp4 video (frame count, FPS, duration)
2. Identifies the rotation segment and neutral center pose
3. Extracts 64 high-quality WebP frames for smooth 360° head rotation
4. Extracts the center.webp neutral pose
5. Detects the exact background color of the video

The video features a character whose head turns through 8 directional poses
(clockwise/counter-clockwise) with a neutral forward-looking pose.

Usage:
    python3 extract_frames.py
"""

import cv2
import numpy as np
import os
import json

VIDEO_PATH = "public/character.mp4"
OUTPUT_DIR = "public/frames"
NUM_FRAMES_OUT = 64  # 360° / 64 = 5.625° per frame


def inspect_video(cap):
    """Inspect and print video metadata."""
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps > 0 else 0

    print("=" * 60)
    print("VIDEO INSPECTION")
    print("=" * 60)
    print(f"  File:        {VIDEO_PATH}")
    print(f"  Resolution:  {width} x {height}")
    print(f"  Frame Count: {frame_count}")
    print(f"  FPS:         {fps}")
    print(f"  Duration:    {duration:.2f}s")
    print("=" * 60)

    return frame_count, fps, width, height, duration


def read_all_frames(cap, frame_count):
    """Read all frames from the video into memory."""
    frames = []
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    for i in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    print(f"  Read {len(frames)} frames into memory")
    return frames


def detect_background_color(frames):
    """
    Detect the exact background color by sampling edge pixels
    from multiple frames and finding the dominant background.
    We sample from multiple edges and use the most frequent color.
    """
    from collections import Counter

    color_samples = []
    sample_indices = np.linspace(0, len(frames) - 1, min(20, len(frames)), dtype=int)

    for idx in sample_indices:
        frame = frames[idx]
        h, w = frame.shape[:2]

        # Sample from corners and edges (larger blocks for robustness)
        regions = [
            frame[0:30, 0:30],           # top-left
            frame[0:30, w-30:w],         # top-right
            frame[h-30:h, 0:30],         # bottom-left
            frame[h-30:h, w-30:w],       # bottom-right
            frame[0:5, w//3:2*w//3],     # top-center strip
            frame[h-5:h, w//3:2*w//3],   # bottom-center strip
        ]
        for region in regions:
            # Round to nearest 5 to group similar colors
            avg = (region.mean(axis=(0, 1)) / 5).round() * 5
            color_samples.append(tuple(avg.astype(int)))

    color_counter = Counter(color_samples)
    most_common_bgr = color_counter.most_common(1)[0][0]
    b, g, r = most_common_bgr

    # Get the exact pixel value from the corner of the first frame
    # (more accurate than averaged/rounded value)
    exact_pixel = frames[0][5, 5]  # 5,5 is safely in the corner
    b_exact, g_exact, r_exact = int(exact_pixel[0]), int(exact_pixel[1]), int(exact_pixel[2])

    hex_color = f"#{r_exact:02x}{g_exact:02x}{b_exact:02x}"

    print(f"\n  Background Color Detection:")
    print(f"    Most common BGR (rounded): ({b}, {g}, {r})")
    print(f"    Exact corner pixel BGR: ({b_exact}, {g_exact}, {r_exact})")
    print(f"    Exact corner pixel RGB: ({r_exact}, {g_exact}, {b_exact})")
    print(f"    HEX: {hex_color}")

    return {"r": int(r_exact), "g": int(g_exact), "b": int(b_exact), "hex": hex_color}


def analyze_motion(frames):
    """
    Analyze frame-to-frame motion to understand the video structure.
    Returns difference magnitudes and finds the rotation + neutral segments.
    """
    diffs = []
    for i in range(1, len(frames)):
        diff = cv2.absdiff(frames[i], frames[i - 1])
        magnitude = diff.mean()
        diffs.append(magnitude)

    print(f"\n  Motion Analysis:")
    print(f"    Total frames: {len(frames)}")
    print(f"    Frame diffs computed: {len(diffs)}")
    print(f"    Avg diff: {np.mean(diffs):.4f}")
    print(f"    Max diff: {np.max(diffs):.4f}")
    print(f"    Min diff: {np.min(diffs):.4f}")
    print(f"    Std diff: {np.std(diffs):.4f}")

    return diffs


def find_segments(frames, diffs):
    """
    Identify the rotation segment and the neutral/center segment.

    Strategy:
    - The video shows head rotation through directions, ending with a neutral pose.
    - The neutral/center pose is typically at or near the end of the video.
    - We look for a sustained period of very low motion near the end = the character
      is holding the neutral pose.
    - Everything before that is the rotation sequence.
    """
    total = len(frames)

    # Use a sliding window to find sustained low-motion regions
    window_size = 12  # ~0.5s at 24fps
    window_avgs = []
    for i in range(len(diffs) - window_size + 1):
        window_avg = np.mean(diffs[i:i + window_size])
        window_avgs.append(window_avg)

    if not window_avgs:
        # Video too short for windowed analysis
        return 0, total - 1, total - 1

    # Find the threshold: low motion = below 30% of median motion
    median_diff = np.median(diffs)
    low_motion_threshold = median_diff * 0.35

    print(f"\n  Segment Detection:")
    print(f"    Median diff: {median_diff:.4f}")
    print(f"    Low-motion threshold: {low_motion_threshold:.4f}")

    # Find the LAST substantial low-motion region (center/neutral pose)
    # Scan from the end of the video backwards
    center_frame_idx = total - 1
    rotation_end = total - 1

    # Look for a period of sustained stillness near the end
    still_start = None
    for i in range(len(diffs) - 1, -1, -1):
        if diffs[i] < low_motion_threshold:
            if still_start is None:
                still_start = i
        else:
            if still_start is not None:
                still_duration = still_start - i
                if still_duration >= 6:  # At least ~0.25s of stillness
                    rotation_end = i + 1
                    center_frame_idx = (i + 1 + still_start) // 2
                    print(f"    Found neutral pose: frames {i+1}-{still_start} "
                          f"(duration: {still_duration} frames)")
                    break
                still_start = None

    # Also check if the last few frames are the neutral pose
    if still_start is not None and still_start == len(diffs) - 1:
        # Stillness extends to the very end
        scan_back = len(diffs) - 1
        while scan_back > 0 and diffs[scan_back] < low_motion_threshold:
            scan_back -= 1
        still_duration = len(diffs) - scan_back
        if still_duration >= 6:
            rotation_end = scan_back + 1
            center_frame_idx = (scan_back + 1 + len(diffs)) // 2
            print(f"    Found neutral pose at end: frames {scan_back+1}-{len(diffs)} "
                  f"(duration: {still_duration} frames)")

    # Print motion timeline for debugging
    print(f"\n  Motion timeline (first 10 diffs): {[f'{d:.2f}' for d in diffs[:10]]}")
    print(f"  Motion timeline (last 10 diffs):  {[f'{d:.2f}' for d in diffs[-10:]]}")

    # Print motion in segments
    seg_size = len(diffs) // 8
    for i in range(8):
        start = i * seg_size
        end = min(start + seg_size, len(diffs))
        seg_avg = np.mean(diffs[start:end])
        print(f"  Segment {i} (frames {start}-{end}): avg diff = {seg_avg:.4f}")

    return 0, rotation_end, center_frame_idx


def extract_frames_uniform(frames, rotation_start, rotation_end, center_frame_idx):
    """
    Extract 64 frames uniformly from the rotation segment.

    The rotation segment contains the head turning through all 8 compass directions.
    We sample uniformly to get approximately 5.6° per frame.
    """
    rotation_length = rotation_end - rotation_start

    print(f"\n  Extraction:")
    print(f"    Rotation start: frame {rotation_start}")
    print(f"    Rotation end:   frame {rotation_end}")
    print(f"    Rotation length: {rotation_length} frames")
    print(f"    Center frame:   {center_frame_idx}")
    print(f"    Output frames:  {NUM_FRAMES_OUT}")

    if rotation_length < NUM_FRAMES_OUT:
        print(f"\n  ⚠ Warning: Rotation segment ({rotation_length} frames) < {NUM_FRAMES_OUT}")
        print(f"    Will interpolate (some source frames will be reused)")

    # Uniformly sample frame indices
    indices = []
    for i in range(NUM_FRAMES_OUT):
        t = i / NUM_FRAMES_OUT
        src_idx = int(rotation_start + t * rotation_length)
        src_idx = min(src_idx, len(frames) - 1)
        indices.append(src_idx)

    # Check for unique source frames
    unique_sources = len(set(indices))
    print(f"    Unique source frames used: {unique_sources}")

    # Map compass directions
    directions = {
        "RIGHT":      0,
        "DOWN-RIGHT": 8,
        "DOWN":       16,
        "DOWN-LEFT":  24,
        "LEFT":       32,
        "UP-LEFT":    40,
        "UP":         48,
        "UP-RIGHT":   56,
    }

    print(f"\n  Compass Direction Mapping:")
    for direction, out_idx in sorted(directions.items(), key=lambda x: x[1]):
        src_idx = indices[out_idx]
        print(f"    {direction:>12s}: output {out_idx:3d} → source frame {src_idx}")

    return indices, directions


def save_frames(frames, indices, center_frame_idx, bg_color):
    """Save the extracted frames as high-quality WebP files."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"\n  Saving {NUM_FRAMES_OUT} rotation frames + center.webp to {OUTPUT_DIR}/")

    encode_params = [cv2.IMWRITE_WEBP_QUALITY, 92]

    for i, src_idx in enumerate(indices):
        filename = os.path.join(OUTPUT_DIR, f"frame-{i:03d}.webp")
        cv2.imwrite(filename, frames[src_idx], encode_params)

    # Save center frame
    center_path = os.path.join(OUTPUT_DIR, "center.webp")
    cv2.imwrite(center_path, frames[center_frame_idx], encode_params)

    # Save metadata
    metadata = {
        "totalFrames": NUM_FRAMES_OUT,
        "backgroundColor": bg_color,
        "centerFrameIndex": center_frame_idx,
        "degreesPerFrame": 360.0 / NUM_FRAMES_OUT,
        "sourceFrameMap": indices,
    }

    meta_path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"  ✓ Saved {NUM_FRAMES_OUT} rotation frames")
    print(f"  ✓ Saved center.webp (source frame {center_frame_idx})")
    print(f"  ✓ Saved metadata.json")

    # File sizes
    sizes = []
    for i in range(NUM_FRAMES_OUT):
        path = os.path.join(OUTPUT_DIR, f"frame-{i:03d}.webp")
        sizes.append(os.path.getsize(path))

    center_size = os.path.getsize(center_path)

    print(f"\n  Frame file sizes:")
    print(f"    Min:     {min(sizes) / 1024:.1f} KB")
    print(f"    Max:     {max(sizes) / 1024:.1f} KB")
    print(f"    Avg:     {np.mean(sizes) / 1024:.1f} KB")
    print(f"    Center:  {center_size / 1024:.1f} KB")
    print(f"    Total:   {(sum(sizes) + center_size) / 1024 / 1024:.2f} MB")


def save_debug_grid(frames, indices, center_frame_idx):
    """Save a debug grid showing sampled frames for visual verification."""
    grid_cols = 8
    grid_rows = 8
    h, w = frames[0].shape[:2]
    thumb_w, thumb_h = 160, 90
    grid = np.zeros((grid_rows * thumb_h, grid_cols * thumb_w, 3), dtype=np.uint8)

    for i, src_idx in enumerate(indices):
        row = i // grid_cols
        col = i % grid_cols
        thumb = cv2.resize(frames[src_idx], (thumb_w, thumb_h))
        y = row * thumb_h
        x = col * thumb_w
        grid[y:y+thumb_h, x:x+thumb_w] = thumb

    debug_path = os.path.join(OUTPUT_DIR, "debug_grid.png")
    cv2.imwrite(debug_path, grid)
    print(f"\n  ✓ Saved debug grid: {debug_path}")

    # Also save center frame as debug
    center_debug = os.path.join(OUTPUT_DIR, "debug_center.png")
    cv2.imwrite(center_debug, frames[center_frame_idx])
    print(f"  ✓ Saved debug center: {center_debug}")


def main():
    print("\n🎬 Portfolio Character Frame Extraction")
    print("=" * 60)

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"ERROR: Could not open {VIDEO_PATH}")
        return

    # Step 1: Inspect
    frame_count, fps, width, height, duration = inspect_video(cap)

    # Step 2: Read all frames
    print("\n📖 Reading all frames...")
    all_frames = read_all_frames(cap, frame_count)
    cap.release()

    if not all_frames:
        print("ERROR: No frames read from video")
        return

    # Step 3: Detect background color
    print("\n🎨 Detecting background color...")
    bg_color = detect_background_color(all_frames)

    # Step 4: Analyze motion
    print("\n📊 Analyzing motion trajectory...")
    diffs = analyze_motion(all_frames)

    # Step 5: Find rotation and neutral segments
    print("\n🔍 Finding rotation and neutral segments...")
    rotation_start, rotation_end, center_frame_idx = find_segments(all_frames, diffs)

    # Step 6: Extract rotation frames
    print("\n🔄 Extracting rotation frames...")
    indices, directions = extract_frames_uniform(
        all_frames, rotation_start, rotation_end, center_frame_idx
    )

    # Step 7: Save frames
    print("\n💾 Saving frames...")
    save_frames(all_frames, indices, center_frame_idx, bg_color)

    # Step 8: Debug grid
    print("\n🔎 Saving debug visualizations...")
    save_debug_grid(all_frames, indices, center_frame_idx)

    print("\n" + "=" * 60)
    print("✅ Frame extraction complete!")
    print(f"   Background color: {bg_color['hex']}")
    print(f"   Frames saved to:  {OUTPUT_DIR}/")
    print(f"   Total output:     {NUM_FRAMES_OUT} frames + center.webp")
    print("=" * 60)


if __name__ == "__main__":
    main()
