import { rmSync } from "node:fs";

rmSync("out/404", { force: true, recursive: true });
rmSync("out/404.html", { force: true });
