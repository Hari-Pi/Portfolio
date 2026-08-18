(() => {
  const backdrop = document.querySelector(".bg-blobs");
  if (!backdrop) return;

  const randomValues = new Uint16Array(8);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    for (let index = 0; index < randomValues.length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * 65536);
    }
  }

  const fraction = (index) => randomValues[index] / 65535;
  const range = (index, min, max) => min + fraction(index) * (max - min);
  const angle = (value) => `${Math.round((value + 360) % 360)}deg`;
  const color = (hue, saturation, lightness, alpha) =>
    `hsla(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%, ${alpha.toFixed(3)})`;

  const baseAngle = range(0, 0, 360);
  backdrop.style.setProperty("--wash-angle-a", angle(baseAngle));
  backdrop.style.setProperty("--wash-angle-b", angle(baseAngle + range(1, 95, 145)));
  backdrop.style.setProperty("--wash-angle-c", angle(baseAngle + range(2, 215, 265)));
  backdrop.style.setProperty(
    "--wash-warm",
    color(range(3, 24, 46), range(4, 68, 82), range(5, 50, 60), range(6, 0.16, 0.22))
  );
  backdrop.style.setProperty(
    "--wash-cool",
    color(range(4, 178, 214), range(5, 48, 68), range(3, 36, 47), range(7, 0.08, 0.13))
  );
  backdrop.style.setProperty(
    "--wash-deep",
    color(range(5, 320, 355), range(3, 24, 38), range(4, 18, 28), range(6, 0.17, 0.23))
  );
  backdrop.style.setProperty("--grid-size", `${Math.round(range(7, 44, 56))}px`);
})();
