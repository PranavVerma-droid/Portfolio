/*
  Runs a fetch for a deferred section (server island). A thrown error becomes undefined, so the
  section can show a short notice; an island that throws returns a 500 and its skeleton never clears.
*/
export async function attempt<T>(load: () => Promise<T>): Promise<T | undefined> {
  try {
    return await load();
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
