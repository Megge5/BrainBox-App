#!/usr/bin/env bash
# ==============================================================================
# BrainBox Android APK Builder Script
# ==============================================================================
# This script compiles and packages the BrainBox Android application into an APK.
#
# Usage:
#   ./build-apk.sh [debug|release|docker]
#
# Examples:
#   ./build-apk.sh debug       # Builds debug APK using local Android SDK/Gradle
#   ./build-apk.sh release     # Builds release APK
#   ./build-apk.sh docker      # Builds APK inside an isolated Docker container
# ==============================================================================

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

BUILD_MODE="${1:-debug}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"
OUTPUT_DIR="$SCRIPT_DIR/dist-apk"

echo -e "${CYAN}${BOLD}"
echo "╔═════════════════════════════════════════════════════════════════╗"
echo "║                🧠 BrainBox Android APK Builder                  ║"
echo "║          Train Your Brain • Jetpack Compose & Kotlin            ║"
echo "╚═════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to build with Docker
build_with_docker() {
    echo -e "${BLUE}ℹ Running containerized build using Dockerfile.apk...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✘ Docker is not installed or not in PATH.${NC}"
        echo -e "${YELLOW}Please install Docker or run './build-apk.sh debug' with Android SDK installed.${NC}"
        exit 1
    fi

    mkdir -p "$OUTPUT_DIR"
    echo -e "${CYAN}Building Docker builder image...${NC}"
    docker build -f "$SCRIPT_DIR/Dockerfile.apk" -t brainbox-apk-builder "$SCRIPT_DIR"

    echo -e "${CYAN}Extracting compiled APK from container...${NC}"
    CONTAINER_ID=$(docker create brainbox-apk-builder)
    docker cp "$CONTAINER_ID:/app/android/app/build/outputs/apk/debug/app-debug.apk" "$OUTPUT_DIR/BrainBox-debug.apk" || \
    docker cp "$CONTAINER_ID:/app/android/app/build/outputs/apk/release/app-release-unsigned.apk" "$OUTPUT_DIR/BrainBox-release.apk"
    docker rm -v "$CONTAINER_ID" > /dev/null

    echo -e "${GREEN}${BOLD}✔ APK built successfully!${NC}"
    echo -e "${GREEN}Location: ${BOLD}$OUTPUT_DIR/BrainBox-debug.apk${NC}"
    exit 0
}

if [ "$BUILD_MODE" == "docker" ]; then
    build_with_docker
fi

echo -e "${BLUE}Step 1: Checking build environment...${NC}"

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "  ${GREEN}✔ Java detected:${NC} $JAVA_VERSION"
else
    echo -e "  ${YELLOW}⚠ Java (JDK 17+) was not found in PATH.${NC}"
    echo -e "    If you have Docker installed, try: ${BOLD}./build-apk.sh docker${NC}"
fi

# Check Android SDK
if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    echo -e "  ${GREEN}✔ ANDROID_HOME found:${NC} $ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ] && [ -d "$ANDROID_SDK_ROOT" ]; then
    echo -e "  ${GREEN}✔ ANDROID_SDK_ROOT found:${NC} $ANDROID_SDK_ROOT"
    export ANDROID_HOME="$ANDROID_SDK_ROOT"
else
    echo -e "  ${YELLOW}⚠ ANDROID_HOME or ANDROID_SDK_ROOT environment variable not set.${NC}"
    echo -e "    Standard locations: ~/Android/Sdk (Linux), ~/Library/Android/sdk (macOS)"
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo -e "  ${GREEN}✔ Found Android SDK in default location:${NC} $ANDROID_HOME"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo -e "  ${GREEN}✔ Found Android SDK in default location:${NC} $ANDROID_HOME"
    else
        echo -e "${YELLOW}Notice: If you do not have Android SDK configured locally:${NC}"
        echo -e "  1. Use Docker: ${BOLD}./build-apk.sh docker${NC}"
        echo -e "  2. Or use GitHub Actions: check ${BOLD}.github/workflows/build-apk.yml${NC}"
        echo -e "  3. Or open the ${BOLD}/android${NC} folder in Android Studio and click ${BOLD}Build > Build APK${NC}."
    fi
fi

echo ""
echo -e "${BLUE}Step 2: Preparing project directory...${NC}"
cd "$ANDROID_DIR"

# Ensure gradlew executable
if [ -f "$ANDROID_DIR/gradlew" ]; then
    chmod +x "$ANDROID_DIR/gradlew"
fi

mkdir -p "$OUTPUT_DIR"

echo ""
if [ "$BUILD_MODE" == "release" ]; then
    echo -e "${BLUE}Step 3: Compiling Release APK...${NC}"
    GRADLE_TASK="assembleRelease"
    OUTPUT_APK_NAME="BrainBox-release-unsigned.apk"
    SRC_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
else
    echo -e "${BLUE}Step 3: Compiling Debug APK...${NC}"
    GRADLE_TASK="assembleDebug"
    OUTPUT_APK_NAME="BrainBox-debug.apk"
    SRC_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

# Run Gradle Build
if command -v ./gradlew &> /dev/null || [ -f "./gradlew" ]; then
    echo -e "${CYAN}Executing: ./gradlew $GRADLE_TASK${NC}"
    ./gradlew $GRADLE_TASK
elif command -v gradle &> /dev/null; then
    echo -e "${CYAN}Executing: gradle $GRADLE_TASK${NC}"
    gradle $GRADLE_TASK
else
    echo -e "${YELLOW}Gradle wrapper or installation not found. Attempting gradle initialization...${NC}"
    echo -e "${YELLOW}Tip: You can also open the project in Android Studio or run './build-apk.sh docker'${NC}"
fi

# Copy generated APK to output directory
if [ -f "$SRC_APK_PATH" ]; then
    cp "$SRC_APK_PATH" "$OUTPUT_DIR/$OUTPUT_APK_NAME"
    echo ""
    echo -e "${GREEN}${BOLD}═════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}🎉 SUCCESS! APK Built Successfully!${NC}"
    echo -e "${GREEN}${BOLD}═════════════════════════════════════════════════════════════════${NC}"
    echo -e "Output APK: ${BOLD}$OUTPUT_DIR/$OUTPUT_APK_NAME${NC}"
    echo -e "File Size:  $(du -h "$OUTPUT_DIR/$OUTPUT_APK_NAME" 2>/dev/null | cut -f1 || echo 'N/A')"
    echo ""
    echo -e "To install on a connected Android phone or emulator via ADB:"
    echo -e "  ${CYAN}adb install -r $OUTPUT_DIR/$OUTPUT_APK_NAME${NC}"
else
    echo ""
    echo -e "${YELLOW}Build completed. If the APK was saved to a custom path, check:${NC}"
    echo -e "  ${CYAN}$ANDROID_DIR/app/build/outputs/apk/${NC}"
fi
