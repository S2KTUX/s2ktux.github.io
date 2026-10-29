#!/bin/bash
# Candidato privado: conserva íntegros los motores y capturas anteriores.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
previous=$build/motor-tsc-v2
candidate=$build/motor-pic-v1
workspace=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
destination=$workspace/motor-experimento/v86-pic-v1.wasm
test ! -e "$candidate"
test ! -e "$destination"
mkdir "$candidate"
cp -a "$previous/source" "$candidate/source"
cd "$candidate/source"
patch --batch --fuzz=0 -p1 <"$workspace/debian/pic-espurio.patch"
export PATH="$build/motor-jit8192-v1/bin:$build/motor-jit8192-v1/rust/bin:$PATH"
export CARGO_HOME="$build/motor-jit8192-v1/cargo-cache"
rustc --edition=2021 --cfg pic_candidate --test "$workspace/debian/probar-pic-espurio.rs" -o "$candidate/pic-test"
"$candidate/pic-test" --nocapture
cargo rustc --offline --release --target wasm32-unknown-unknown -- -C linker=tools/rust-lld-wrapper -C link-args="--import-table --global-base=4096 --v86-strip-debug" -C link-args="build/softfloat.o" -C link-args="build/zstddeclib.o" -C target-feature=+bulk-memory -C target-feature=+multivalue -C target-feature=+simd128 >"$candidate/compilacion.log" 2>&1
install -m 644 build/wasm32-unknown-unknown/release/v86.wasm "$destination"
sha256sum "$destination"
