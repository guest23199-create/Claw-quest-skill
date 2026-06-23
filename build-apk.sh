#!/bin/bash
# Manual APK build script for Claw Quest
# Uses system Android SDK tools (aapt2, d8, apksigner)
# Compatible with ARM64 systems

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$PROJECT_DIR/app"
SRC_DIR="$APP_DIR/src/main"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-34/android.jar"
BUILD_TOOLS="/usr/lib/android-sdk/build-tools/34.0.0"
AAPT2="/usr/bin/aapt2"
AAPT="/usr/bin/aapt"
APKSIGNER="/usr/bin/apksigner"
ZIPALIGN="/usr/bin/zipalign"
D8="$BUILD_TOOLS/d8"

BUILD_DIR="$APP_DIR/build/manual"
GEN_DIR="$BUILD_DIR/gen"
OBJ_DIR="$BUILD_DIR/obj"
DEX_DIR="$BUILD_DIR/dex"

# Clean
rm -rf "$BUILD_DIR"
mkdir -p "$GEN_DIR" "$OBJ_DIR" "$DEX_DIR"

echo "=== Step 1: Compile resources with AAPT2 ==="
"$AAPT2" compile \
    --dir "$SRC_DIR/res" \
    -o "$BUILD_DIR/compiled_res.zip"

echo "=== Step 2: Link resources with assets ==="
"$AAPT2" link \
    --manifest "$SRC_DIR/AndroidManifest.xml" \
    -I "$ANDROID_JAR" \
    -A "$SRC_DIR/assets" \
    --java "$GEN_DIR" \
    -o "$BUILD_DIR/unaligned.apk" \
    "$BUILD_DIR/compiled_res.zip"

echo "=== Step 3: Compile Java source ==="
javac -d "$OBJ_DIR" \
    -classpath "$ANDROID_JAR" \
    -source 1.8 -target 1.8 \
    "$SRC_DIR/java/clawquest/MainActivity.java"

echo "=== Step 4: Convert to DEX ==="
"$D8" --lib "$ANDROID_JAR" \
    --output "$DEX_DIR" \
    "$OBJ_DIR/clawquest/MainActivity.class"

echo "=== Step 5: Add DEX to APK ==="
cd "$DEX_DIR"
"$AAPT" add "$BUILD_DIR/unaligned.apk" classes.dex
cd "$PROJECT_DIR"

echo "=== Step 6: Zipalign (before signing) ==="
"$ZIPALIGN" -v -f 4 "$BUILD_DIR/unaligned.apk" "$BUILD_DIR/aligned.apk"

echo "=== Step 7: Sign the APK ==="
# Generate debug keystore if needed
if [ ! -f "$PROJECT_DIR/debug.keystore" ]; then
    keytool -genkey -v -keystore "$PROJECT_DIR/debug.keystore" \
        -alias debug -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android \
        -dname "CN=Debug, OU=Debug, O=Debug, L=Debug, ST=Debug, C=US"
fi

"$APKSIGNER" sign --ks "$PROJECT_DIR/debug.keystore" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$BUILD_DIR/ClawQuest-final.apk" \
    "$BUILD_DIR/aligned.apk"

echo ""
echo "=== Build complete! ==="
echo "APK: $BUILD_DIR/ClawQuest-final.apk"
ls -lh "$BUILD_DIR/ClawQuest-final.apk"
