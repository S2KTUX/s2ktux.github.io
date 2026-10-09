// No resetear la CPU mientras continúa un lote del motor o una operación de
// disco del arranque anterior: sus callbacks podrían llegar después del reset.
export async function restartMachine(emulator, disks) {
  await emulator.stop();
  await Promise.all(disks.map(disk => disk.settle()));
  emulator.restart();
  await emulator.run();
}
