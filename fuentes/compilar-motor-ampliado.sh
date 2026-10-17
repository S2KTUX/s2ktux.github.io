#!/bin/bash
# Constructor aislado. Las herramientas se instalan solo en este directorio,
# no en Windows, las VMs del alumno ni el PATH permanente de WSL.
set -Eeuo pipefail
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
build=/home/s2ktux/kubernetes-browser-build-20261012/motor-jit8192-v1
source="$build/source"
test ! -e "$source"
test ! -e "$project/motor-experimento/v86-jit8192.wasm"
mkdir -p "$build/downloads"
for name in rust-1.90.0-x86_64-unknown-linux-gnu rust-std-1.90.0-wasm32-unknown-unknown; do
 archive="$name.tar.xz"
 if [ ! -f "$build/downloads/$archive" ]; then
  curl --fail --location --retry 3 "https://static.rust-lang.org/dist/$archive" -o "$build/downloads/$archive"
 fi
 curl --fail --location --retry 3 "https://static.rust-lang.org/dist/$archive.sha256" -o "$build/downloads/$archive.sha256"
 (cd "$build/downloads" && sha256sum --check "$archive.sha256")
 if [ ! -d "$build/$name" ]; then tar -xf "$build/downloads/$archive" -C "$build"; fi
done
zig_archive=zig-x86_64-linux-0.14.1.tar.xz
if [ ! -f "$build/downloads/$zig_archive" ]; then curl --fail --location --retry 3 "https://ziglang.org/download/0.14.1/$zig_archive" -o "$build/downloads/$zig_archive"; fi
printf '%s  %s\n' 24aeeec8af16c381934a6cd7d95c807a8cb2cf7df9fa40d359aa884195c4716c "$build/downloads/$zig_archive" | sha256sum --check --status
if [ ! -d "$build/zig-x86_64-linux-0.14.1" ]; then tar -xf "$build/downloads/$zig_archive" -C "$build"; fi
if [ ! -x "$build/rust/bin/rustc" ]; then "$build/rust-1.90.0-x86_64-unknown-linux-gnu/install.sh" --prefix="$build/rust" --components=rustc,cargo,rust-std-x86_64-unknown-linux-gnu --disable-ldconfig; fi
if [ ! -d "$build/rust/lib/rustlib/wasm32-unknown-unknown" ]; then "$build/rust-std-1.90.0-wasm32-unknown-unknown/install.sh" --prefix="$build/rust" --disable-ldconfig; fi
cp -a "$project/motor-experimento/fuentes-jit8192" "$source"
mkdir -p "$build/bin" "$source/build"
ln -s "$build/rust/lib/rustlib/x86_64-unknown-linux-gnu/bin/rust-lld" "$build/bin/lld"
export PATH="$build/bin:$build/rust/bin:$PATH"
export CARGO_HOME="$build/cargo-cache" ZIG_GLOBAL_CACHE_DIR="$build/zig-cache"
cd "$source"
zig="$build/zig-x86_64-linux-0.14.1/zig"
"$zig" cc -c -Wall -target wasm32-freestanding -O3 -flto -nostdlib -fvisibility=hidden -ffunction-sections -fdata-sections -DSOFTFLOAT_FAST_INT64 -DINLINE_LEVEL=5 -DSOFTFLOAT_FAST_DIV32TO16 -DSOFTFLOAT_FAST_DIV64TO32 -o build/softfloat.o lib/softfloat/softfloat.c
"$zig" cc -c -Wall -target wasm32-freestanding -O3 -flto -nostdlib -fvisibility=hidden -ffunction-sections -fdata-sections -DZSTDLIB_VISIBILITY= -o build/zstddeclib.o lib/zstd/zstddeclib.c
chmod 755 tools/rust-lld-wrapper
cargo rustc --release --target wasm32-unknown-unknown -- -C linker=tools/rust-lld-wrapper -C link-args="--import-table --global-base=4096 --v86-strip-debug" -C link-args="build/softfloat.o" -C link-args="build/zstddeclib.o" -C target-feature=+bulk-memory -C target-feature=+multivalue -C target-feature=+simd128 2>&1 | tee "$build/compilacion.log"
sha256sum build/wasm32-unknown-unknown/release/v86.wasm
cp -n build/wasm32-unknown-unknown/release/v86.wasm "$project/motor-experimento/v86-jit8192.wasm"
